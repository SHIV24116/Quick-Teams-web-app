import os
from flask import Flask, render_template, request, redirect, url_for, flash
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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


group_members = db.Table(
    "group_members",
    db.Column("group_id", db.Integer, db.ForeignKey("group.id")),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
)


class ConnectionRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    status = db.Column(db.String(20), default="pending")

    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    members = db.relationship("User", secondary=group_members, backref="groups")

# -------------------- CREATE TABLES --------------------
with app.app_context():
    db.create_all()

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

# ---------- CORE FEATURES ----------
@app.route("/matches")
@login_required
def matches():
    users = User.query.filter(
        User.availability == True,
        User.id != current_user.id
    ).all()
    return render_template("matches.html", users=users)


@app.route("/teamup/<int:user_id>", methods=["POST"])
@login_required
def teamup(user_id):
    existing = ConnectionRequest.query.filter(
        or_(
            and_(ConnectionRequest.sender_id == current_user.id,
                 ConnectionRequest.receiver_id == user_id),
            and_(ConnectionRequest.sender_id == user_id,
                 ConnectionRequest.receiver_id == current_user.id),
        )
    ).first()

    if existing:
        flash("Request already exists", "info")
        return redirect(url_for("matches"))

    db.session.add(ConnectionRequest(
        sender_id=current_user.id,
        receiver_id=user_id
    ))
    db.session.commit()

    flash("Request sent", "success")
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

        group = Group(name=f"Team_{req.sender.username}_{req.receiver.username}")
        group.members.extend([req.sender, req.receiver])

        db.session.add(group)
        db.session.commit()

    return redirect(url_for("requests_page"))

# ---------- EXTRA PAGES (USED BY index.html) ----------
@app.route("/my_groups")
@login_required
def my_groups():
    return render_template("my_groups.html", groups=current_user.groups)


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
        flash("Profile updated", "success")
        return redirect(url_for("home"))

    return render_template("updatepro.html", user=current_user)

# -------------------- MAIN --------------------
if __name__ == "__main__":
    app.run()
