from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import (
    LoginManager, UserMixin, login_user,
    logout_user, login_required, current_user
)
import os

# -------------------- APP CONFIG --------------------
app = Flask(__name__, instance_relative_config=True)

# Ensure instance folder exists (for SQLite)
os.makedirs(app.instance_path, exist_ok=True)

# Secret key
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")

# Database configuration (SQLite default, PostgreSQL compatible)
db_path = os.path.join(app.instance_path, "database.db")
database_url = os.getenv("DATABASE_URL")

if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url or f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Upload configuration
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "static/uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Initialize extensions
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# -------------------- MODELS --------------------
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(50))
    skills = db.Column(db.String(200))
    linkedin = db.Column(db.String(200))
    github = db.Column(db.String(200))
    education = db.Column(db.String(200))
    photo = db.Column(db.String(200))
    availability = db.Column(db.Boolean, default=True)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

group_members = db.Table(
    "group_members",
    db.Column("group_id", db.Integer, db.ForeignKey("group.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
)

class ConnectionRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    status = db.Column(db.String(20), default="pending")

    sender = db.relationship("User", foreign_keys=[sender_id], backref="sent_requests")
    receiver = db.relationship("User", foreign_keys=[receiver_id], backref="received_requests")

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    members = db.relationship("User", secondary=group_members, backref="groups")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------------------- HELPERS --------------------
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_photo(file_storage):
    if not file_storage or file_storage.filename == "":
        return None
    if not allowed_file(file_storage.filename):
        flash("⚠️ Invalid image type. Allowed: png, jpg, jpeg, gif, webp.", "error")
        return None

    filename = secure_filename(file_storage.filename)
    base, ext = os.path.splitext(filename)
    i = 1
    candidate = filename

    while os.path.exists(os.path.join(app.config["UPLOAD_FOLDER"], candidate)):
        candidate = f"{base}_{i}{ext}"
        i += 1

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], candidate)
    file_storage.save(filepath)
    return candidate

# -------------------- ROUTES --------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"].strip().lower()
        password = request.form.get("password", "").strip()

        if not password or len(password) < 4:
            flash("⚠️ Password must be at least 4 characters.", "error")
            return redirect(url_for("register"))

        if User.query.filter_by(username=username).first():
            flash("⚠️ Username already used. Please choose another.", "error")
            return redirect(url_for("register"))

        user = User(
            username=username,
            name=request.form.get("name", "").strip(),
            skills=request.form.get("skills", "").strip(),
            linkedin=request.form.get("linkedin", "").strip(),
            github=request.form.get("github", "").strip(),
            education=request.form.get("education", "").strip(),
            photo=save_photo(request.files.get("photo")) or "default.png",
            availability=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash("✅ Registration successful! Please login.", "success")
        return redirect(url_for("login"))

    return render_template("profile.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"].strip().lower()
        password = request.form.get("password", "")

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash("✅ Logged in successfully", "success")
            return redirect(url_for("home"))

        flash("❌ Invalid username or password", "error")
        return redirect(url_for("login"))

    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("👋 Logged out.", "success")
    return redirect(url_for("login"))

@app.route("/my_groups")
@login_required
def my_groups():
    return render_template("my_groups.html", groups=current_user.groups)

@app.route("/available_choices")
@login_required
def available_choices():
    users = User.query.filter(User.availability == True, User.id != current_user.id).all()
    groups = Group.query.all()
    return render_template("available_choices.html", users=users, groups=groups)

@app.route("/toggle/<int:user_id>", methods=["POST"])
@login_required
def toggle_availability(user_id):
    if current_user.id != user_id:
        flash("❌ You can only change your own availability.", "error")
        return redirect(url_for("available_choices"))

    current_user.availability = not current_user.availability
    db.session.commit()
    flash("✅ Availability updated!", "success")
    return redirect(url_for("available_choices"))

@app.route("/matches")
@login_required
def matches():
    required_skill = request.args.get("skill")
    if required_skill:
        skills = [s.strip().lower() for s in required_skill.split(",") if s.strip()]
        filters = [User.skills.ilike(f"%{s}%") for s in skills]
        users = User.query.filter(and_(*filters), User.availability == True, User.id != current_user.id).all()
    else:
        users = User.query.filter(User.availability == True, User.id != current_user.id).all()

    return render_template("matches.html", users=users, skill=required_skill)

@app.route("/teamup/<int:user_id>", methods=["POST"])
@login_required
def teamup(user_id):
    if user_id == current_user.id:
        flash("⚠️ You cannot send a request to yourself.", "error")
        return redirect(url_for("matches"))

    existing = ConnectionRequest.query.filter(
        db.or_(
            db.and_(ConnectionRequest.sender_id == current_user.id,
                    ConnectionRequest.receiver_id == user_id,
                    ConnectionRequest.status == "pending"),
            db.and_(ConnectionRequest.sender_id == user_id,
                    ConnectionRequest.receiver_id == current_user.id,
                    ConnectionRequest.status == "pending"),
        )
    ).first()

    if existing:
        flash("ℹ️ A pending request already exists.", "info")
        return redirect(url_for("matches"))

    db.session.add(ConnectionRequest(sender_id=current_user.id, receiver_id=user_id))
    db.session.commit()
    flash("📩 Team-up request sent!", "success")
    return redirect(url_for("matches"))

@app.route("/requests")
@login_required
def requests_page():
    incoming = ConnectionRequest.query.filter_by(receiver_id=current_user.id, status="pending").all()
    outgoing = ConnectionRequest.query.filter_by(sender_id=current_user.id).all()
    return render_template("requests.html", incoming=incoming, outgoing=outgoing)

@app.route("/accept_request/<int:req_id>", methods=["POST"])
@login_required
def accept_request(req_id):
    req = ConnectionRequest.query.get(req_id)
    if req and req.receiver_id == current_user.id and req.status == "pending":
        req.status = "accepted"
        group = Group(name=f"Team_{req.sender.username}_{req.receiver.username}")
        group.members.extend([req.sender, req.receiver])
        req.sender.availability = False
        req.receiver.availability = False
        db.session.add(group)
        db.session.commit()
        flash("✅ Request accepted! Group created.", "success")
    else:
        flash("❌ Invalid request.", "error")

    return redirect(url_for("requests_page"))

@app.route("/join_group/<int:group_id>", methods=["POST"])
@login_required
def join_group(group_id):
    group = Group.query.get(group_id)
    if group and current_user not in group.members:
        group.members.append(current_user)
        db.session.commit()
        flash("✅ You joined the group!", "success")
    else:
        flash("ℹ️ Already a member or group not found.", "info")

    return redirect(url_for("available_choices"))

@app.route("/update_profile", methods=["GET", "POST"])
@login_required
def update_profile():
    if request.method == "POST":
        current_user.name = request.form.get("name", current_user.name)
        current_user.skills = request.form.get("skills", current_user.skills)
        current_user.linkedin = request.form.get("linkedin", current_user.linkedin)
        current_user.github = request.form.get("github", current_user.github)
        current_user.education = request.form.get("education", current_user.education)

        new_photo = save_photo(request.files.get("photo"))
        if new_photo:
            current_user.photo = new_photo

        db.session.commit()
        flash("✅ Profile updated.", "success")
        return redirect(url_for("home"))

    return render_template("updatepro.html", user=current_user)

# -------------------- MAIN --------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
