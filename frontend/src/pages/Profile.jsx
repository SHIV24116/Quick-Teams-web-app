import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';
import SkillSelector from '../components/SkillSelector';
import {
  User,
  Github,
  Linkedin,
  GraduationCap,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Save
} from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    linkedin: '',
    github: '',
    education: '',
    about_me: '',
    availability: true
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        skills: user.skills || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        education: user.education || '',
        about_me: user.about_me || '',
        availability: user.availability ?? true
      });
      if (user.photo) {
        setPhotoPreview(`/uploads/${user.photo}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (skillsString) => {
    setFormData((prev) => ({ ...prev, skills: skillsString }));
  };

  const handleToggleAvailability = () => {
    setFormData({ ...formData, availability: !formData.availability });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (photo) {
      data.append('photo', photo);
    }

    dispatch(updateProfile(data));
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
        {/* Header Profile Summary */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-brand-500 overflow-hidden shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-600 text-white flex items-center justify-center font-extrabold text-2xl">
                {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user.name || user.username}
            </h2>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">@{user.username}</div>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                formData.availability
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{formData.availability ? 'Looking for Team' : 'Just Browsing'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Talent Search Availability</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Turn on to appear in active hackathon radar search
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAvailability}
              className="text-brand-500 focus:outline-none"
            >
              {formData.availability ? (
                <ToggleRight className="w-10 h-10 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-400" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Education / Organization
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Unstop-Style Interactive Skill Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Techstack & Skills
            </label>
            <SkillSelector
              value={formData.skills}
              onChange={handleSkillsChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Profile URL
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              About Me Pitch
            </label>
            <textarea
              rows={3}
              name="about_me"
              value={formData.about_me}
              onChange={handleChange}
              placeholder="What are your hackathon goals?"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Update Avatar Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 dark:file:bg-slate-800 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
