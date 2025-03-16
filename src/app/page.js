'use client';

import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function PreferredDaysSelect({ selectedDays, setSelectedDays }) {
  const [query, setQuery] = useState('');
  
  const filteredDays = query.trim() === '' ? dayOptions : dayOptions.filter(day =>
    day.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Combobox value={selectedDays} onChange={setSelectedDays} multiple>
        <div className="relative">
          <Combobox.Input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:outline-none bg-white transition-all duration-200"
            placeholder="Select preferred days"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setQuery('')}
          />
          <ChevronUpDownIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>

        <Combobox.Options className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-lg max-h-60 overflow-auto">
          {filteredDays.map((day) => (
            <Combobox.Option
              key={day}
              value={day}
              className={({ active }) =>
                `cursor-pointer select-none relative px-4 py-2 ${
                  active ? 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white' : 'text-gray-900'
                } transition-colors duration-150`
              }
            >
              {({ selected }) => (
                <div className="flex items-center">
                  {selected && (
                    <CheckIcon className="w-5 h-5 mr-2 text-green-500 transition-transform duration-200 transform scale-110" />
                  )}
                  {day}
                </div>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>

      {selectedDays.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedDays.map((day) => (
            <span key={day} className="px-3 py-1 bg-gradient-to-r from-fuchsia-100 to-violet-100 text-fuchsia-700 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-sm">
              {day}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  // State variables
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', hoursPerWeek: 1, preferredDays:[] });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', designation: '', preferredDays:[] });
  const [newTimetable, setNewTimetable] = useState({ name: '', description: '', hoursPerDay: 6 });
  const [activeTab, setActiveTab] = useState('courses');

  // API URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch initial data
  useEffect(() => {
    fetchCourses();
    fetchStaff();
    fetchTimetables();
  }, []);

  // API handlers
  async function fetchCourses() {
    const res = await fetch(`${API_URL}/courses`);
    const data = await res.json();
    setCourses(data);
  }

  async function fetchStaff() {
    try {
      const res = await fetch(`${API_URL}/staff`);
      const data = await res.json();
      console.log("Fetched staff:", data);
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  }

  async function fetchTimetables() {
    const res = await fetch(`${API_URL}/timetables`);
    const data = await res.json();
    setTimetables(data);
  }

  async function createStaff(e) {
    e.preventDefault();
    await fetch(`${API_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff)
    });
    await fetchStaff();
    setNewStaff({ name: '', email: '', designation: '', preferredDays: [] });
  }
  
  async function createCourse(e) {
    e.preventDefault();
    await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    });
    await fetchCourses();
    setNewCourse({ name: '', code: '', hoursPerWeek: 1, preferredDays: [] });
  }
  
  

  async function createTimetable(e) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/timetables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTimetable)
    });
    await fetchTimetables();
    setNewTimetable({ name: '', description: '', hoursPerDay: 6 });
  }

  async function generateTimetable(id) {
    const res = await fetch(`${API_URL}/timetables/${id}/generate`, {
      method: 'POST'
    });
    const data = await res.json();
    setSelectedTimetable(data);
    await fetchTimetables();
  }

  async function assignCourse(staffId, courseId) {
    try {
      console.log(`Assigning course ${courseId} to staff ${staffId}`);
      const res = await fetch(`${API_URL}/staff/${staffId}/assign-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error assigning course:", errorData);
        return;
      }
      
      const data = await res.json();
      console.log("Assignment response:", data);
      await fetchStaff();
    } catch (error) {
      console.error("Error in assignCourse:", error);
    }
    await fetchStaff();
  }

  async function removeCourse(staffId, courseId) {
    const res = await fetch(`${API_URL}/staff/${staffId}/remove-course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId })
    });
    await fetchStaff();
  }

  async function deleteCourse(id) {
    await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' });
    await fetchCourses();
  }

  async function deleteStaff(id) {
    await fetch(`${API_URL}/staff/${id}`, { method: 'DELETE' });
    await fetchStaff();
  }

  async function deleteTimetable(id) {
    await fetch(`${API_URL}/timetables/${id}`, { method: 'DELETE' });
    await fetchTimetables();
    if (selectedTimetable && selectedTimetable._id === id) {
      setSelectedTimetable(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-fuchsia-700 via-purple-600 to-violet-600 py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white text-center tracking-tight">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              Timetable Management System
            </span>
          </h1>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-200 mb-6 justify-center">
          {['courses', 'staff', 'timetables'].map((tab) => (
            <button 
              key={tab}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-300 ease-in-out ${
                activeTab === tab 
                  ? 'text-white bg-fuchsia-600 border-b-2 border-fuchsia-600 transform translate-y-1' 
                  : 'text-gray-500 hover:text-fuchsia-500 hover:bg-fuchsia-50'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Courses</h2>
            </div>
            
            <form onSubmit={createCourse} className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Course Name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Course Code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  type="number"
                  placeholder="Hours Per Week"
                  value={newCourse.hoursPerWeek}
                  onChange={(e) => setNewCourse({ ...newCourse, hoursPerWeek: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              {/* Preferred Days Selection */}
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">Preferred Days</label>
                <PreferredDaysSelect 
                  selectedDays={newCourse.preferredDays}
                  setSelectedDays={(days) => setNewCourse({ ...newCourse, preferredDays: days })}
                />
              </div>

              <button 
                type="submit" 
                className="mt-4 bg-fuchsia-600 text-white px-6 py-2 rounded-lg hover:bg-fuchsia-700 transition duration-300 transform hover:translate-y-[-2px] hover:shadow-md"
              >
                Add Course
              </button>
            </form>
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-fuchsia-50 to-violet-50 border-b">
                  <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Code</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Hours/Week</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Preferred Days</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map(course => (
                    <tr key={course._id} className="hover:bg-fuchsia-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-sm">{course.name}</td>
                      <td className="py-3 px-4 text-sm">{course.code}</td>
                      <td className="py-3 px-4 text-sm">{course.hoursPerWeek}</td>
                      <td className="py-3 px-4">
                        {course.preferredDays.map((day) => (
                          <span key={day} className="px-2 py-1 bg-gray-200 text-xs rounded-md mr-1">
                            {day}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => deleteCourse(course._id)} 
                          className="text-red-600 hover:text-red-800 mr-2 flex items-center transition-all duration-200 hover:scale-110"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td className="py-4 px-4 text-sm text-center text-gray-500" colSpan="4">No courses available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Staff</h2>
            </div>
            
            <form onSubmit={createStaff} className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Designation"
                  value={newStaff.designation}
                  onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                />
              </div>

              {/* Preferred Days Selection */}
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">Preferred Days</label>
                <PreferredDaysSelect 
                  selectedDays={newStaff.preferredDays}
                  setSelectedDays={(days) => setNewStaff({ ...newStaff, preferredDays: days })}
                />
              </div>

              <button 
                type="submit" 
                className="mt-4 bg-fuchsia-600 text-white px-6 py-2 rounded-lg hover:bg-fuchsia-700 transition duration-300 transform hover:translate-y-[-2px] hover:shadow-md"
              >
                Add Staff
              </button>
            </form>
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-fuchsia-50 to-violet-50 border-b">
                  <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Designation</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Preferred Days</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.map(s => (
                    <tr key={s._id} className="hover:bg-fuchsia-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-sm">{s.name}</td>
                      <td className="py-3 px-4 text-sm">{s.email}</td>
                      <td className="py-3 px-4 text-sm">{s.designation || '-'}</td>
                      <td className="py-3 px-4">
                        {s.availableDays.map((day) => (
                          <span key={day} className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs font-medium mr-1 transition-all duration-200 hover:bg-fuchsia-200">
                            {day}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedStaff({...s, courses: s.courses || []})}
                          className="text-violet-600 hover:text-violet-800 mr-2 transition-all duration-200 hover:scale-110"
                        >
                          Assign Courses
                        </button>
                        <button 
                          onClick={() => deleteStaff(s._id)}
                          className="text-red-600 hover:text-red-800 mr-2 flex items-center transition-all duration-200 hover:scale-110"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td className="py-4 px-4 text-sm text-center text-gray-500" colSpan="4">No staff available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {selectedStaff && (
              <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 transform transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Assign Courses to {selectedStaff.name}</h3>
                    <button 
                      onClick={() => setSelectedStaff(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-lg mb-2">Assigned Courses</h4>
                    {!selectedStaff.courses ? (
                      <p className="text-gray-500">No courses array found for this staff member.</p>
                    ) : selectedStaff.courses.length === 0 ? (
                      <p className="text-gray-500">No courses assigned yet.</p>
                    ) : (
                      <ul className="bg-gray-50 rounded-md divide-y">
                        {selectedStaff.courses.map(course => (
                          <li key={course._id} className="flex justify-between items-center p-3">
                            <span>{course.name} ({course.code})</span>
                            <button 
                              onClick={() => removeCourse(selectedStaff._id, course._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg mb-2">Available Courses</h4>
                    {courses
                      .filter(course => !selectedStaff.courses.some(c => c._id === course._id))
                      .length === 0 ? (
                      <p className="text-gray-500">No more courses available to assign.</p>
                    ) : (
                      <ul className="bg-gray-50 rounded-md divide-y">
                        {courses
                          .filter(course => !selectedStaff.courses.some(c => c._id === course._id))
                          .map(course => (
                            <li key={course._id} className="flex justify-between items-center p-3">
                              <span>{course.name} ({course.code})</span>
                              <button 
                                onClick={() => assignCourse(selectedStaff._id, course._id)}
                                className="text-violet-600 hover:text-violet-800 text-sm"
                              >
                                Assign
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="mt-6 text-right">
                    <button 
                      onClick={() => setSelectedStaff(null)}
                      className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:from-gray-300 hover:to-gray-400 transition duration-300 shadow-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Timetables Tab */}
        {activeTab === 'timetables' && (
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Timetables</h2>
            </div>
            
          <form onSubmit={createTimetable} className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Name"
                  value={newTimetable.name}
                  onChange={(e) => setNewTimetable({...newTimetable, name: e.target.value})}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Description"
                  value={newTimetable.description}
                  onChange={(e) => setNewTimetable({...newTimetable, description: e.target.value})}
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  type="number"
                  placeholder="Hours Per Day"
                  value={newTimetable.hoursPerDay}
                  onChange={(e) => setNewTimetable({...newTimetable, hoursPerDay: Number(e.target.value)})}
                  min="1"
                  max="12"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="mt-4 bg-fuchsia-600 text-white px-6 py-2 rounded-lg hover:bg-fuchsia-700 transition duration-300 transform hover:translate-y-[-2px] hover:shadow-md"
                >
                Create Timetable
              </button>
            </form>
            
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-fuchsia-50 to-violet-50 border-b">
                  <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Hours/Day</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-fuchsia-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timetables.map(timetable => (
                    <tr key={timetable._id} className="hover:bg-fuchsia-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-sm">{timetable.name}</td>
                      <td className="py-3 px-4 text-sm">{timetable.description || '-'}</td>
                      <td className="py-3 px-4 text-sm">{timetable.hoursPerDay}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => generateTimetable(timetable._id)}
                          className="text-green-600 hover:text-green-800 mr-2 transition-all duration-200 hover:scale-110"
                        >
                          Generate
                        </button>
                        <button 
                          onClick={() => setSelectedTimetable(timetable)}
                          className="text-violet-600 hover:text-violet-800 mr-2 transition-all duration-200 hover:scale-110"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => deleteTimetable(timetable._id)}
                          className="text-red-600 hover:text-red-800 mr-2 flex items-center transition-all duration-200 hover:scale-110"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {timetables.length === 0 && (
                    <tr>
                      <td className="py-4 px-4 text-sm text-center text-gray-500" colSpan="4">No timetables available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {selectedTimetable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Timetable: {selectedTimetable.name}
                  </h3>
                  <button 
                    onClick={() => setSelectedTimetable(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {!selectedTimetable.schedule ? (
                  <div className="text-center py-12 bg-fuchsia-50 rounded-lg">
                    <svg className="mx-auto h-16 w-16 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-700">This timetable is empty and waiting to be filled!</p>
                    <p className="mt-2 text-gray-500">Click the "Generate" button to create a schedule.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedTimetable.schedule.map((day, dayIndex) => (
                      <div key={dayIndex} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h4 className="font-semibold text-lg mb-4 text-fuchsia-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {day.day}
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-md">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Course</th>
                                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Staff</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {day.slots.map((slot, slotIndex) => (
                                <tr key={slotIndex} className={slot.course ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="py-2 px-4 text-sm">
                                    {slot.time.start} - {slot.time.end}
                                  </td>
                                  <td className="py-2 px-4 text-sm">
                                    {slot.course ? (
                                      <span className="font-medium text-fuchsia-600">{slot.course.name}</span>
                                    ) : (
                                      <div className="flex items-center">
                                        <span className="text-green-500 mr-2">
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                          </svg>
                                        </span>
                                        <span className="text-gray-500 italic">Free time to relax!</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 px-4 text-sm">
                                    {slot.staff ? (
                                      slot.staff.name
                                    ) : slot.course ? (
                                    <span className="text-gray-500 italic">🤷‍♂️ Uh-oh! Who should we assign?</span>
                                  ):(
                                      <div className="flex items-center">
                                        <span className="text-green-500 mr-2">
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                          </svg>
                                        </span>
                                        <span className="text-gray-500 italic">No staffs are here!</span>
                                      </div>
                                      )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 text-right">
                  <button 
                    onClick={() => setSelectedTimetable(null)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 mt-12 w-full h-fit">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            &copy; {new Date().getFullYear()} Timetable Management System
          </p>
          <p className="text-xs mt-1 opacity-60">Crafted with ❤️ by Hemanth</p>
        </div>
      </footer>
    </main>
  );
}