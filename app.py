from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_
from werkzeug.utils import secure_filename
import os

# Initialize Flask
app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database setup (SQLite with SQLAlchemy)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# --------------------
# User model (single definition)
# --------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)  # unique username
    name = db.Column(db.String(50))  # real name (can be duplicate)
    skills = db.Column(db.String(200))
    linkedin = db.Column(db.String(200))
    github = db.Column(db.String(200))
    education = db.Column(db.String(200))
    photo = db.Column(db.String(200))  # store filename of uploaded photo
    availability = db.Column(db.Boolean, default=True)

# --------------------
# Routes
# --------------------

# Home Page
@app.route('/')
def home():
    return render_template('index.html')

# Registration Page
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip().lower()
        name = request.form['name']
        skills = request.form['skills']
        linkedin = request.form.get('linkedin')
        github = request.form.get('github')
        education = request.form.get('education')

        # Check for unique username
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return "⚠️ Username already taken. Please choose another."

        # Handle photo upload
        photo = request.files.get("photo")
        photo_filename = None
        if photo and photo.filename != "":
            photo_filename = secure_filename(photo.filename)
            photo.save(os.path.join(app.config["UPLOAD_FOLDER"], photo_filename))

        # Save user
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
        return redirect(url_for('matches'))

    return render_template('profile.html')

# Available Profiles Page
@app.route('/available_choices')
def available_choices():
    users = User.query.filter_by(availability=True).all()
    return render_template('available_choices.html', users=users)

# Toggle availability (Available ↔ Busy)
@app.route('/toggle/<int:user_id>', methods=['POST'])
def toggle_availability(user_id):
    user = User.query.get(user_id)
    if user:
        user.availability = not user.availability
        db.session.commit()
    return redirect(url_for('available_choices'))

# Matchmaking Page
@app.route('/matches')
def matches():
    required_skill = request.args.get("skill", None)

    if required_skill:
        skill_list = [s.strip().lower() for s in required_skill.split(",")]  # split by comma
        filters = [User.skills.ilike(f"%{skill}%") for skill in skill_list]  # case-insensitive
        users = User.query.filter(and_(*filters), User.availability == True).all()
    else:
        users = User.query.filter_by(availability=True).all()

    return render_template("matches.html", users=users, skill=required_skill)

# --------------------
# Run app
# --------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
