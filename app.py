import os
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager, UserMixin, login_user,
    logout_user, login_required, current_user
)
from sqlalchemy import and_, or_
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# -------------------- APP CONFIG --------------------
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "devsecret")

# -------------------- DATABASE (PostgreSQL) --------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# -------------------- UPLOAD CONFIG --------------------
UPLOAD_FOLDER = "/tmp/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# -------------------- EXTENSIONS --------------------
db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = "login"

# -------------------- MODELS --------------------
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    name = db.Column(db.String(100))
    skills = db.Column(db.String(300))
    linkedin = db.Column(db.String(200))
    github = db.Column(db.String(200))
    education = db.Column(db.String(200))
    photo = db.Column(db.String(200))
    availability = db.Column(db.Boolean, default=True)
    about_me = db.Column(db.Text)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


group_members = db.Table(
    "group_members",
    db.Column("group_id", db.Integer, db.ForeignKey("group.id")),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
)

group_admins = db.Table(
    "group_admins",
    db.Column("group_id", db.Integer, db.ForeignKey("group.id")),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
)

class ConnectionRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    group_id = db.Column(db.Integer, db.ForeignKey("group.id"))
    status = db.Column(db.String(20), default="pending")
    purpose = db.Column(db.Text)

    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])
    group = db.relationship("Group", foreign_keys=[group_id])


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    members = db.relationship("User", secondary=group_members, backref="groups")
    admins = db.relationship("User", secondary=group_admins, backref="admin_groups")

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("group.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship("User", foreign_keys=[sender_id])
    group = db.relationship("Group", foreign_keys=[group_id], backref="messages")

# -------------------- CREATE TABLES --------------------
with app.app_context():
    db.create_all()
    try:
        db.session.execute(db.text("ALTER TABLE connection_request ADD COLUMN purpose TEXT"))
        db.session.commit()
    except Exception:
        db.session.rollback()
        
    try:
        db.session.execute(db.text("ALTER TABLE user ADD COLUMN about_me TEXT"))
        db.session.commit()
    except Exception:
        db.session.rollback()
        
    try:
        db.session.execute(db.text("ALTER TABLE `group` ADD COLUMN description TEXT"))
        db.session.commit()
    except Exception:
        db.session.rollback()
        
    try:
        db.session.execute(db.text("ALTER TABLE connection_request ADD COLUMN group_id INTEGER REFERENCES `group`(id)"))
        db.session.commit()
    except Exception:
        db.session.rollback()

# -------------------- LOGIN MANAGER --------------------
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# -------------------- HELPERS --------------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_photo(file):
    if not file or file.filename == "":
        return None
    if not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)
    return filename

# -------------------- ROUTES --------------------
@app.route("/")
@login_required
def home():
    return render_template("index.html")

# ---------- AUTH ----------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"].strip().lower()
        password = request.form["password"]

        if User.query.filter_by(username=username).first():
            flash("Username already exists", "error")
            return redirect(url_for("register"))

        user = User(
            username=username,
            name=request.form.get("name"),
            skills=request.form.get("skills"),
            linkedin=request.form.get("linkedin"),
            github=request.form.get("github"),
            education=request.form.get("education"),
            photo=save_photo(request.files.get("photo")),
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        flash("Registration successful. Please login.", "success")
        return redirect(url_for("login"))

    return render_template("profile.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"].strip().lower()
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for("home"))

        flash("Invalid credentials", "error")

    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ---------- CORE FEATURES ----------
@app.route("/matches")
@login_required
def matches():
    query = request.args.get("q", "").strip()
    base_query = User.query.filter(User.availability == True, User.id != current_user.id)
    users = base_query.all()
    
    if query:
        search_terms = [term.lower() for term in query.replace(',', ' ').split() if term]
        scored_users = []
        
        for user in users:
            score = 0
            
            # Exact ID matches strongly
            if query.isdigit() and user.id == int(query):
                score += 100
                
            user_data = f"{user.username or ''} {user.name or ''} {user.skills or ''}".lower()
            
            for term in search_terms:
                if term in user_data:
                    score += 10
                    # Extra points for exact word boundaries
                    if f" {term} " in f" {user_data.replace(',', ' ')} ":
                        score += 5
                        
            if score > 0:
                scored_users.append((score, user))
                
        # Sort by score descending (most relevant first)
        scored_users.sort(key=lambda x: x[0], reverse=True)
        users = [u for score, u in scored_users]
        
    return render_template("matches.html", users=users, q=query)


@app.route("/teamup/<int:user_id>", methods=["POST"])
@login_required
def teamup(user_id):
    group_id = request.form.get("group_id")
    purpose = request.form.get("purpose", "")
    
    if not group_id:
        flash("You must select a team to invite this user to.", "error")
        return redirect(url_for("matches"))
        
    group = db.session.get(Group, int(group_id))
    if not group or current_user not in group.admins:
        flash("Invalid team or you are not an admin.", "error")
        return redirect(url_for("matches"))

    existing = ConnectionRequest.query.filter_by(
        receiver_id=user_id, group_id=group.id, status="pending"
    ).first()

    if existing:
        flash("An invite to this team is already pending for this user.", "info")
        return redirect(url_for("matches"))

    db.session.add(ConnectionRequest(
        sender_id=current_user.id,
        receiver_id=user_id,
        group_id=group.id,
        purpose=purpose
    ))
    db.session.commit()

    flash(f"Invite sent from {group.name}", "success")
    return redirect(url_for("matches"))


@app.route("/requests")
@login_required
def requests_page():
    incoming = ConnectionRequest.query.filter_by(
        receiver_id=current_user.id,
        status="pending"
    ).all()
    return render_template("requests.html", incoming=incoming)


@app.route("/accept/<int:req_id>", methods=["POST"])
@login_required
def accept(req_id):
    req = ConnectionRequest.query.get(req_id)
    if req and req.receiver_id == current_user.id:
        req.status = "accepted"

        if req.group and req.receiver not in req.group.members:
            req.group.members.append(req.receiver)

        db.session.commit()

    return redirect(url_for("requests_page"))

@app.route("/decline/<int:req_id>", methods=["POST"])
@login_required
def decline(req_id):
    req = ConnectionRequest.query.get(req_id)
    if req and req.receiver_id == current_user.id:
        db.session.delete(req)
        db.session.commit()
        flash("Request declined.", "info")
    return redirect(url_for("requests_page"))

# ---------- EXTRA PAGES (USED BY index.html) ----------
@app.route("/my_groups")
@login_required
def my_groups():
    return render_template("my_groups.html", groups=current_user.groups, admin_groups=current_user.admin_groups)

@app.route("/create_team", methods=["POST"])
@login_required
def create_team():
    name = request.form.get("name", "").strip()
    description = request.form.get("description", "").strip()
    if name:
        new_group = Group(name=name, description=description)
        new_group.members.append(current_user)
        new_group.admins.append(current_user)
        db.session.add(new_group)
        db.session.commit()
        flash(f"Team '{name}' successfully created!", "success")
    return redirect(url_for("my_groups"))

@app.route("/group/<int:group_id>")
@login_required
def group_chat(group_id):
    group = Group.query.get_or_404(group_id)
    if current_user not in group.members:
        flash("You are not a member of this group.", "error")
        return redirect(url_for("my_groups"))
    
    return render_template("group_chat.html", group=group)

@app.route("/group/<int:group_id>/send", methods=["POST"])
@login_required
def send_message(group_id):
    group = Group.query.get_or_404(group_id)
    if current_user not in group.members:
        return redirect(url_for("my_groups"))
        
    content = request.form.get("content", "").strip()
    if content:
        msg = Message(group_id=group.id, sender_id=current_user.id, content=content)
        db.session.add(msg)
        db.session.commit()
        
    return redirect(url_for("group_chat", group_id=group.id))

@app.route("/leave_group/<int:group_id>", methods=["POST"])
@login_required
def leave_group(group_id):
    group = Group.query.get_or_404(group_id)
    if current_user in group.members:
        group.members.remove(current_user)
        if current_user in group.admins:
            group.admins.remove(current_user)
        db.session.commit()
        flash(f"You left the group {group.name}.", "info")
    return redirect(url_for("my_groups"))

@app.route("/make_admin/<int:group_id>/<int:user_id>", methods=["POST"])
@login_required
def make_admin(group_id, user_id):
    group = Group.query.get_or_404(group_id)
    if current_user in group.admins:
        target_user = User.query.get_or_404(user_id)
        if target_user in group.members and target_user not in group.admins:
            group.admins.append(target_user)
            db.session.commit()
            flash(f"{target_user.username} is now an admin.", "success")
    return redirect(url_for("group_chat", group_id=group.id))

@app.route("/remove_member/<int:group_id>/<int:user_id>", methods=["POST"])
@login_required
def remove_member(group_id, user_id):
    group = Group.query.get_or_404(group_id)
    if current_user in group.admins:
        target_user = User.query.get_or_404(user_id)
        if target_user in group.members and target_user != current_user:
            group.members.remove(target_user)
            if target_user in group.admins:
                group.admins.remove(target_user)
            db.session.commit()
            flash(f"Removed {target_user.username} from the team.", "success")
    return redirect(url_for("group_chat", group_id=group.id))

@app.route("/update_profile", methods=["GET", "POST"])
@login_required
def update_profile():
    if request.method == "POST":
        current_user.name = request.form.get("name", current_user.name)
        current_user.skills = request.form.get("skills", current_user.skills)
        current_user.linkedin = request.form.get("linkedin", current_user.linkedin)
        current_user.github = request.form.get("github", current_user.github)
        current_user.education = request.form.get("education", current_user.education)
        current_user.about_me = request.form.get("about_me", current_user.about_me)
        
        avail_val = request.form.get("availability")
        if avail_val is not None:
            current_user.availability = (avail_val == "1")

        new_photo = save_photo(request.files.get("photo"))
        if new_photo:
            current_user.photo = new_photo

        db.session.commit()
        flash("Profile updated", "success")
        return redirect(url_for("home"))

    return render_template("updatepro.html", user=current_user)

# -------------------- MAIN --------------------
if __name__ == "__main__":
    app.run()
