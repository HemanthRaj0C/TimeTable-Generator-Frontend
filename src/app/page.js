'use client';

import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function PreferredDaysSelect({ selectedDays, setSelectedDays }) {
  const [query, setQuery] = useState('');
  
  // Ensure full list appears when input is focused
  const filteredDays = query.trim() === '' ? dayOptions : dayOptions.filter(day =>
    day.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Combobox value={selectedDays} onChange={setSelectedDays} multiple>
        <div className="relative">
          <Combobox.Input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Select preferred days"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setQuery('')} // Show full list on focus
          />
          <ChevronUpDownIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
        </div>

        <Combobox.Options className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-md max-h-60 overflow-auto">
          {filteredDays.map((day) => (
            <Combobox.Option
              key={day}
              value={day}
              className={({ active }) =>
                `cursor-pointer select-none relative px-4 py-2 ${
                  active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <div className="flex items-center">
                  {selected && <CheckIcon className="w-5 h-5 mr-2 text-green-500" />}
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
            <span key={day} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md text-sm">
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
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white text-center">Timetable Management System</h1>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'courses' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'staff' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'timetables' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
            onClick={() => setActiveTab('timetables')}
          >
            Timetables
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Courses</h2>
            </div>
            
            <form onSubmit={createCourse} className="mb-6 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Course Name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Course Code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Add Course
              </button>
            </form>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Code</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Hours/Week</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Preferred Days</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map(course => (
                    <tr key={course._id} className="hover:bg-gray-50">
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
                          className="text-red-600 hover:text-red-800 mr-2"
                        >
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Staff</h2>
            </div>
            
            <form onSubmit={createStaff} className="mb-6 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Add Staff
              </button>
            </form>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Designation</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Preferred Days</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{s.name}</td>
                      <td className="py-3 px-4 text-sm">{s.email}</td>
                      <td className="py-3 px-4 text-sm">{s.designation || '-'}</td>
                      <td className="py-3 px-4">
                        {s.availableDays.map((day) => (
                          <span key={day} className="px-2 py-1 bg-gray-200 text-xs rounded-md mr-1">
                            {day}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedStaff({...s, courses: s.courses || []})}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Assign Courses
                        </button>
                        <button 
                          onClick={() => deleteStaff(s._id)}
                          className="text-red-600 hover:text-red-800"
                        >
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
                                className="text-blue-600 hover:text-blue-800 text-sm"
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
        
        {/* Timetables Tab */}
        {activeTab === 'timetables' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Timetables</h2>
            </div>
            
            <form onSubmit={createTimetable} className="mb-6 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Name"
                  value={newTimetable.name}
                  onChange={(e) => setNewTimetable({...newTimetable, name: e.target.value})}
                  required
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Description"
                  value={newTimetable.description}
                  onChange={(e) => setNewTimetable({...newTimetable, description: e.target.value})}
                />
                <input
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Create Timetable
              </button>
            </form>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Hours/Day</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timetables.map(timetable => (
                    <tr key={timetable._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{timetable.name}</td>
                      <td className="py-3 px-4 text-sm">{timetable.description || '-'}</td>
                      <td className="py-3 px-4 text-sm">{timetable.hoursPerDay}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => generateTimetable(timetable._id)}
                          className="text-green-600 hover:text-green-800 mr-2"
                        >
                          Generate
                        </button>
                        <button 
                          onClick={() => setSelectedTimetable(timetable)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => deleteTimetable(timetable._id)}
                          className="text-red-600 hover:text-red-800"
                        >
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
                  <div className="text-center py-12 bg-indigo-50 rounded-lg">
                    <svg className="mx-auto h-16 w-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-700">This timetable is empty and waiting to be filled!</p>
                    <p className="mt-2 text-gray-500">Click the "Generate" button to create a schedule.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedTimetable.schedule.map((day, dayIndex) => (
                      <div key={dayIndex} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-2 text-indigo-600">{day.day}</h4>
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
                                      <span className="font-medium text-indigo-600">{slot.course.name}</span>
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
      <footer className="bg-gray-800 text-white py-4 mt-8 absolute w-full bottom-0">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} School Timetable Management System
        </div>
      </footer>
    </main>
  );
}