import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Check, Code2, Sparkles, Search } from 'lucide-react';

const PRESET_TECHSTACKS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'MySQL', 'PostgreSQL',
  'MongoDB', 'FastAPI', 'Express', 'Tailwind CSS', 'Docker', 'Git', 'Java', 'C++', 'Go',
  'Rust', 'Next.js', 'Redux', 'GraphQL', 'AWS', 'Firebase', 'Figma', 'PyTorch', 'TensorFlow',
  'Django', 'Flask', 'Spring Boot', 'Kubernetes', 'Redis', 'Vue.js', 'Angular', 'Flutter',
  'React Native', 'Swift', 'Kotlin', 'Solidity', 'Linux', 'REST API', 'WebSockets', 'HTML5', 'CSS3'
];

const SkillSelector = ({ value = '', onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  // Convert comma-separated string to array of skill strings
  const selectedSkills = value
    ? value.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateSkills = (newSkillsArray) => {
    // Unique skills preserving casing
    const unique = Array.from(new Set(newSkillsArray));
    onChange(unique.join(', '));
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      updateSkills([...selectedSkills, trimmed]);
    }
    setInputValue('');
  };

  const removeSkill = (skillToRemove) => {
    updateSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  // Filter preset techstacks based on current input and exclude already selected
  const matchingPresets = PRESET_TECHSTACKS.filter((tech) => {
    const matchesSearch = tech.toLowerCase().includes(inputValue.trim().toLowerCase());
    const notSelected = !selectedSkills.some((s) => s.toLowerCase() === tech.toLowerCase());
    return matchesSearch && notSelected;
  });

  // Popular suggested skills to display as quick-add chips below
  const quickSuggestions = PRESET_TECHSTACKS.filter(
    (tech) => !selectedSkills.some((s) => s.toLowerCase() === tech.toLowerCase())
  ).slice(0, 10);

  return (
    <div ref={wrapperRef} className="space-y-3">
      {/* Selected Skill Badges Container */}
      <div
        className={`min-h-[52px] p-2.5 rounded-2xl border transition-all flex flex-wrap items-center gap-2 ${
          isFocused
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-slate-800'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80'
        }`}
        onClick={() => setIsFocused(true)}
      >
        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 animate-fadeIn"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              className="p-0.5 rounded-md hover:bg-brand-200 dark:hover:bg-brand-800 text-brand-500 dark:text-brand-400 hover:text-brand-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedSkills.length === 0 ? "Type techstack (e.g. React, Python, Node.js)..." : "Add more skills..."}
          className="flex-1 min-w-[180px] bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-1"
        />
      </div>

      {/* Autocomplete Dropdown List */}
      {isFocused && inputValue.trim() !== '' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {matchingPresets.length > 0 ? (
            matchingPresets.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addSkill(tech)}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700/60 hover:text-brand-600 dark:hover:text-brand-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Code2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>{tech}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() => addSkill(inputValue)}
              className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700/60 flex items-center space-x-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add custom skill "{inputValue.trim()}"</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Suggestion Chips (Unstop Style) */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Popular Hackathon Techstacks (Click to add)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => addSkill(tech)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all"
            >
              <Plus className="w-3 h-3 text-slate-400" />
              <span>{tech}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillSelector;
