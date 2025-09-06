from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from werkzeug.utils import secure_filename
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
import os

# Initialize Flask
app = Flask(__name__)
app.secret_key = "supersecretkey"   # required for sessions

# Configure upload folder
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# -------------------- LOGIN MANAGER --------------------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# -------------------- MODELS --------------------
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(50))
    skills = db.Column(db.String(200))
    linkedin = db.Column(db.String(200))
    github = db.Column(db.String(200))
    education = db.Column(db.String(200))
    photo = db.Column(db.String(200))
    availability = db.Column(db.Boolean, default=True)

class ConnectionRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(20), default="pending")  # pending, accepted, rejected

    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    members = db.relationship("User", secondary="group_members", backref="groups")

group_members = db.Table(
    'group_members',
    db.Column('group_id', db.Integer, db.ForeignKey('group.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

# -------------------- LOGIN MANAGER --------------------
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------------------- ROUTES --------------------
@app.route('/')
def home():
    return render_template('index.html')

# Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip().lower()
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash("⚠️ Username already used. Please choose another.", "error")
            return redirect(url_for('register'))
        ...

        photo = request.files.get("photo")
        photo_filename = None
        if photo and photo.filename != "":
            photo_filename = secure_filename(photo.filename)
            photo.save(os.path.join(app.config["UPLOAD_FOLDER"], photo_filename))

        user = User(
            username=username,
            name=name,
            skills=skills,
            linkedin=linkedin,
            github=github,
            education=education,
            photo=photo_filename,
            availability=True
        )
        db.session.add(user)
        db.session.commit()
        flash("✅ Registration successful! Please login.")
        return redirect(url_for('login'))

    return render_template('profile.html')

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip().lower()
        user = User.query.filter_by(username=username).first()
        if user:
            login_user(user)
            flash("✅ Logged in successfully")
            return redirect(url_for('home'))
        else:
            flash("❌ Invalid username")
            return redirect(url_for('login'))
    return render_template("login.html")

# Logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("✅ Logged out")
    return redirect(url_for('home'))

# from flask_login import login_required, current_user

@app.route('/my_groups')
@login_required
def my_groups():
    return render_template('my_groups.html', groups=current_user.groups)


# Available Choices
@app.route('/available_choices')
@login_required
def available_choices():
    users = User.query.filter_by(availability=True).all()
    groups = Group.query.all()
    return render_template('available_choices.html', users=users, groups=groups)

# Toggle availability
@app.route('/toggle/<int:user_id>', methods=['POST'])
@login_required
def toggle_availability(user_id):
    if current_user.id != user_id:   # ✅ user can only toggle their own status
        flash("❌ You can only change your own availability.", "error")
        return redirect(url_for('available_choices'))

    current_user.availability = not current_user.availability
    db.session.commit()
    flash("✅ Availability updated!", "success")
    return redirect(url_for('available_choices'))

# @app.route('/toggle/<int:user_id>', methods=['POST'])
# @login_required
# def toggle_availability(user_id):
#     if current_user.id == user_id:
#         current_user.availability = not current_user.availability
#         db.session.commit()
#     return redirect(url_for('available_choices'))

# Matches
@app.route('/matches')
@login_required
def matches():
    required_skill = request.args.get("skill", None)
    if required_skill:
        skill_list = [s.strip().lower() for s in required_skill.split(",")]
        filters = [User.skills.ilike(f"%{skill}%") for skill in skill_list]
        users = User.query.filter(and_(*filters), User.availability == True).all()
    else:
        users = User.query.filter_by(availability=True).all()
    return render_template("matches.html", users=users, skill=required_skill)

# Team up request
@app.route('/teamup/<int:user_id>', methods=['POST'])
@login_required
def teamup(user_id):
    if user_id == current_user.id:
        flash("⚠️ You cannot send a request to yourself.")
        return redirect(url_for('matches'))

    new_request = ConnectionRequest(sender_id=current_user.id, receiver_id=user_id)
    db.session.add(new_request)
    db.session.commit()
    flash("📩 Team-up request sent!")
    return redirect(url_for('matches'))

# View requests
@app.route('/requests')
@login_required
def requests_page():
    incoming = ConnectionRequest.query.filter_by(receiver_id=current_user.id, status="pending").all()
    outgoing = ConnectionRequest.query.filter_by(sender_id=current_user.id).all()
    return render_template("requests.html", incoming=incoming, outgoing=outgoing)

# Accept request
@app.route('/accept_request/<int:req_id>', methods=['POST'])
@login_required
def accept_request(req_id):
    req = ConnectionRequest.query.get(req_id)
    if req and req.receiver_id == current_user.id and req.status == "pending":
        req.status = "accepted"
        group = Group(name=f"Team_{req.sender.username}_{req.receiver.username}")
        group.members.append(req.sender)
        group.members.append(req.receiver)
        db.session.add(group)
        db.session.commit()
        flash("✅ Request accepted! Group created.")
    return redirect(url_for('requests_page'))

# Join group
@app.route('/join_group/<int:group_id>', methods=['POST'])
@login_required
def join_group(group_id):
    group = Group.query.get(group_id)
    if group and current_user not in group.members:
        group.members.append(current_user)
        db.session.commit()
        flash("✅ You joined the group!")
    return redirect(url_for('available_choices'))

# -------------------- RUN APP --------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
 