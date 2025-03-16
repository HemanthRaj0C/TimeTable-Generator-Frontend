"use client"

// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

// API base URL - make sure to update this with your actual backend URL
const API_URL = 'http://localhost:5000/api';

export default function Home() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('courses');
  
  // State for data
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  
  // Form states
  const [courseForm, setCourseForm] = useState({ name: '', code: '', hoursPerWeek: 1, preferredDays: [] });
  const [staffForm, setStaffForm] = useState({ 
    name: '', 
    email: '', 
    designation: '', 
    availableDays: [], 
    availableHoursPerDay: 6,
    courses: []
  });
  const [timetableForm, setTimetableForm] = useState({ name: '', description: '', workingDays: [], hoursPerDay: 6 });
  
  // State for editing
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingTimetable, setEditingTimetable] = useState(null);
  
  // Days of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Fetch data on component mount
  useEffect(() => {
    fetchCourses();
    fetchStaff();
    fetchTimetables();
  }, []);

  // API functions
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses`);
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses');
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API_URL}/staff`);
      setStaff(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Failed to fetch staff');
    }
  };

  const fetchTimetables = async () => {
    try {
      const res = await axios.get(`${API_URL}/timetables`);
      setTimetables(res.data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      alert('Failed to fetch timetables');
    }
  };

  // Course CRUD operations
  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/courses`, courseForm);
      setCourseForm({ name: '', code: '', hoursPerWeek: 1, preferredDays: [] });
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/courses/${editingCourse._id}`, courseForm);
      setEditingCourse(null);
      setCourseForm({ name: '', code: '', hoursPerWeek: 1, preferredDays: [] });
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${API_URL}/courses/${id}`);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  // Staff CRUD operations
  const createStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/staff`, staffForm);
      setStaffForm({ name: '', email: '', designation: '', availableDays: [], availableHoursPerDay: 6 });
      fetchStaff();
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Failed to create staff');
    }
  };

  const updateStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/staff/${editingStaff._id}`, staffForm);
      setEditingStaff(null);
      setStaffForm({ name: '', email: '', designation: '', availableDays: [], availableHoursPerDay: 6 });
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update staff');
    }
  };

  const deleteStaff = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await axios.delete(`${API_URL}/staff/${id}`);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff');
    }
  };

  const assignCourse = async (staffId, courseId) => {
    try {
      if (!courseId) {
        alert('Please select a course to assign');
        return;
      }
      await axios.post(`${API_URL}/staff/${staffId}/assign-course`, { courseId });
      fetchStaff();
    } catch (error) {
      console.error('Error assigning course:', error);
      alert(error.response?.data?.message || 'Failed to assign course');
    }
  };

  const removeCourse = async (staffId, courseId) => {
    try {
      await axios.post(`${API_URL}/staff/${staffId}/remove-course`, { courseId });
      fetchStaff();
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Failed to remove course');
    }
  };

  // Timetable CRUD operations
  const createTimetable = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/timetables`, timetableForm);
      setTimetableForm({ name: '', description: '', workingDays: [], hoursPerDay: 6 });
      fetchTimetables();
    } catch (error) {
      console.error('Error creating timetable:', error);
      alert('Failed to create timetable');
    }
  };

  const updateTimetable = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/timetables/${editingTimetable._id}`, timetableForm);
      setEditingTimetable(null);
      setTimetableForm({ name: '', description: '', workingDays: [], hoursPerDay: 6 });
      fetchTimetables();
    } catch (error) {
      console.error('Error updating timetable:', error);
      alert('Failed to update timetable');
    }
  };

  const deleteTimetable = async (id) => {
    if (!confirm('Are you sure you want to delete this timetable?')) return;
    try {
      await axios.delete(`${API_URL}/timetables/${id}`);
      fetchTimetables();
    } catch (error) {
      console.error('Error deleting timetable:', error);
      alert('Failed to delete timetable');
    }
  };

  const generateSchedule = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/timetables/${id}/generate`);
      setSelectedTimetable(res.data);
      fetchTimetables();
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule');
    }
  };

  const updateSlot = async (timetableId, dayIndex, slotIndex, courseId, staffId) => {
    try {
      const res = await axios.put(`${API_URL}/timetables/${timetableId}/slot/${dayIndex}/${slotIndex}`, {
        courseId,
        staffId
      });
      setSelectedTimetable(res.data);
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Failed to update slot');
    }
  };

  // Handle form changes
  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const preferredDays = [...courseForm.preferredDays];
      if (checked) {
        preferredDays.push(value);
      } else {
        const index = preferredDays.indexOf(value);
        if (index > -1) {
          preferredDays.splice(index, 1);
        }
      }
      setCourseForm({ ...courseForm, preferredDays });
    } else if (name === 'hoursPerWeek') {
      setCourseForm({ ...courseForm, [name]: parseInt(value, 10) });
    } else {
      setCourseForm({ ...courseForm, [name]: value });
    }
  };

  const handleStaffChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const availableDays = [...staffForm.availableDays];
      if (checked) {
        availableDays.push(value);
      } else {
        const index = availableDays.indexOf(value);
        if (index > -1) {
          availableDays.splice(index, 1);
        }
      }
      setStaffForm({ ...staffForm, availableDays });
    } else if (name === 'availableHoursPerDay') {
      setStaffForm({ ...staffForm, [name]: parseInt(value, 10) });
    } else {
      setStaffForm({ ...staffForm, [name]: value });
    }
  };

  const handleTimetableChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const workingDays = [...timetableForm.workingDays];
      if (checked) {
        workingDays.push(value);
      } else {
        const index = workingDays.indexOf(value);
        if (index > -1) {
          workingDays.splice(index, 1);
        }
      }
      setTimetableForm({ ...timetableForm, workingDays });
    } else if (name === 'hoursPerDay') {
      setTimetableForm({ ...timetableForm, [name]: parseInt(value, 10) });
    } else {
      setTimetableForm({ ...timetableForm, [name]: value });
    }
  };

  // Start editing an item
  const startEditingCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      hoursPerWeek: course.hoursPerWeek,
      preferredDays: course.preferredDays || []
    });
  };

  const startEditingStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name,
      email: staffMember.email,
      designation: staffMember.designation || '',
      availableDays: staffMember.availableDays || [],
      availableHoursPerDay: staffMember.availableHoursPerDay,
      courses: staffMember.courses || []
    });
  };

  const startEditingTimetable = (timetable) => {
    setEditingTimetable(timetable);
    setTimetableForm({
      name: timetable.name,
      description: timetable.description || '',
      workingDays: timetable.workingDays || [],
      hoursPerDay: timetable.hoursPerDay
    });
  };

  // Cancel editing
  const cancelEditing = (type) => {
    switch (type) {
      case 'course':
        setEditingCourse(null);
        setCourseForm({ name: '', code: '', hoursPerWeek: 1, preferredDays: [] });
        break;
      case 'staff':
        setEditingStaff(null);
        setStaffForm({ name: '', email: '', designation: '', availableDays: [], availableHoursPerDay: 6 });
        break;
      case 'timetable':
        setEditingTimetable(null);
        setTimetableForm({ name: '', description: '', workingDays: [], hoursPerDay: 6 });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Timetable Management System</title>
        <meta name="description" content="Timetable Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Timetable Management System</h1>
        
        {/* Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-1 ${
                  activeTab === 'courses'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-4 px-1 ${
                  activeTab === 'staff'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => setActiveTab('timetables')}
                className={`py-4 px-1 ${
                  activeTab === 'timetables'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Timetables
              </button>
            </nav>
          </div>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">{editingCourse ? 'Edit Course' : 'Create Course'}</h2>
            <form onSubmit={editingCourse ? updateCourse : createCourse} className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    name="name"
                    value={courseForm.name}
                    onChange={handleCourseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Course Code</label>
                  <input
                    type="text"
                    name="code"
                    value={courseForm.code}
                    onChange={handleCourseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Hours Per Week</label>
                  <input
                    type="number"
                    name="hoursPerWeek"
                    value={courseForm.hoursPerWeek}
                    onChange={handleCourseChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Preferred Days</label>
                <div className="flex flex-wrap gap-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`course-${day}`}
                        name="preferredDays"
                        value={day}
                        checked={courseForm.preferredDays.includes(day)}
                        onChange={handleCourseChange}
                        className="mr-2"
                      />
                      <label htmlFor={`course-${day}`}>{day}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                {editingCourse && (
                  <button
                    type="button"
                    onClick={() => cancelEditing('course')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>

            <h2 className="text-2xl font-semibold mb-4">Course List</h2>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map(course => (
                    <tr key={course._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{course.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{course.hoursPerWeek}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(course.preferredDays || []).join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => startEditingCourse(course)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No courses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">{editingStaff ? 'Edit Staff' : 'Create Staff'}</h2>
            <form onSubmit={editingStaff ? updateStaff : createStaff} className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={staffForm.name}
                    onChange={handleStaffChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={staffForm.email}
                    onChange={handleStaffChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={staffForm.designation}
                    onChange={handleStaffChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Available Hours Per Day</label>
                  <input
                    type="number"
                    name="availableHoursPerDay"
                    value={staffForm.availableHoursPerDay}
                    onChange={handleStaffChange}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Available Days</label>
                <div className="flex flex-wrap gap-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`staff-${day}`}
                        name="availableDays"
                        value={day}
                        checked={staffForm.availableDays.includes(day)}
                        onChange={handleStaffChange}
                        className="mr-2"
                      />
                      <label htmlFor={`staff-${day}`}>{day}</label>
                    </div>
                  ))}
                </div>
              </div>

<div className="mb-4">
  <label className="block text-gray-700 mb-2">Assign Courses</label>
  <select
    name="courses"
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    onChange={(e) => {
      if (e.target.value) {
        assignCourse(editingStaff?._id || staffForm._id, e.target.value);
        e.target.value = '';
      }
    }}
    defaultValue=""
  >
    <option value="" disabled>Select course to assign</option>
    {courses
      .filter(course => !staffForm.courses?.includes(course._id))
      .map(course => (
        <option key={course._id} value={course._id}>
          {course.name} ({course.code})
        </option>
      ))}
  </select>
</div>
              
              <div className="flex justify-end space-x-2">
                {editingStaff && (
                  <button
                    type="button"
                    onClick={() => cancelEditing('staff')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingStaff ? 'Update Staff' : 'Create Staff'}
                </button>
              </div>
            </form>

            <h2 className="text-2xl font-semibold mb-4">Staff List</h2>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map(staffMember => (
                    <tr key={staffMember._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{staffMember.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{staffMember.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{staffMember.designation || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {staffMember.courses && staffMember.courses.map(course => {
                            const courseObj = courses.find(c => c._id === course);
                            return courseObj ? (
                              <span key={course} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                                {courseObj.name}
                                <button
                                  onClick={() => removeCourse(staffMember._id, course)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                          
                          {/* Assign course dropdown */}
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignCourse(staffMember._id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                              defaultValue=""
                            >
                              <option value="" disabled>Assign course</option>
                              {courses
                                .filter(c => !staffMember.courses || !staffMember.courses.includes(c._id))
                                .map(course => (
                                  <option key={course._id} value={course._id}>
                                    {course.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => startEditingStaff(staffMember)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStaff(staffMember._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No staff found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Timetables Tab */}
        {activeTab === 'timetables' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">{editingTimetable ? 'Edit Timetable' : 'Create Timetable'}</h2>
            <form onSubmit={editingTimetable ? updateTimetable : createTimetable} className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={timetableForm.name}
                    onChange={handleTimetableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={timetableForm.description}
                    onChange={handleTimetableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Hours Per Day</label>
                  <input
                    type="number"
                    name="hoursPerDay"
                    value={timetableForm.hoursPerDay}
                    onChange={handleTimetableChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`timetable-${day}`}
                        name="workingDays"
                        value={day}
                        checked={timetableForm.workingDays.includes(day)}
                        onChange={handleTimetableChange}
                        className="mr-2"
                      />
                      <label htmlFor={`timetable-${day}`}>{day}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {editingTimetable && (
                  <button
                    type="button"
                    onClick={() => cancelEditing('timetable')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingTimetable ? 'Update Timetable' : 'Create Timetable'}
                </button>
              </div>
            </form>

            <h2 className="text-2xl font-semibold mb-4">Timetable List</h2>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timetables.map(timetable => (
                    <tr key={timetable._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{timetable.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{timetable.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{(timetable.workingDays || []).join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{timetable.hoursPerDay}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => startEditingTimetable(timetable)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTimetable(timetable._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => generateSchedule(timetable._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Generate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {timetables.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No timetables found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}