'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  // State variables
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', hoursPerWeek: 1 });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', designation: '' });
  const [newTimetable, setNewTimetable] = useState({ name: '', description: '', hoursPerDay: 6 });

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

  async function createCourse(e) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    });
    await fetchCourses();
    setNewCourse({ name: '', code: '', hoursPerWeek: 1 });
  }

  async function createStaff(e) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff)
    });
    await fetchStaff();
    setNewStaff({ name: '', email: '', designation: '' });
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
    <main>
      <h1>School Timetable Management</h1>
      
      <div>
        <h2>Courses</h2>
        <form onSubmit={createCourse}>
          <input
            placeholder="Name"
            value={newCourse.name}
            onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
            required
          />
          <input
            placeholder="Code"
            value={newCourse.code}
            onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Hours Per Week"
            value={newCourse.hoursPerWeek}
            onChange={(e) => setNewCourse({...newCourse, hoursPerWeek: Number(e.target.value)})}
            min="1"
            required
          />
          <button type="submit">Add Course</button>
        </form>
        <ul>
          {courses.map(course => (
            <li key={course._id}>
              {course.name} ({course.code}) - {course.hoursPerWeek}h/week
              <button onClick={() => deleteCourse(course._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Staff</h2>
        <form onSubmit={createStaff}>
          <input
            placeholder="Name"
            value={newStaff.name}
            onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={newStaff.email}
            onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
            required
          />
          <input
            placeholder="Designation"
            value={newStaff.designation}
            onChange={(e) => setNewStaff({...newStaff, designation: e.target.value})}
          />
          <button type="submit">Add Staff</button>
        </form>
        <ul>
          {staff.map(s => (
            <li key={s._id}>
            {s.name} ({s.email})
            <button onClick={() => setSelectedStaff({...s, courses: s.courses || []})}>Assign Courses</button>

            <button onClick={() => deleteStaff(s._id)}>Delete</button>
          </li>
          ))}
        </ul>
        
        {selectedStaff && (
          <div>
          <h3>Assign Courses to {selectedStaff.name}</h3>
          <h4>Assigned Courses</h4>
          {!selectedStaff.courses ? (
            <p>No courses array found for this staff member. Staff data: {JSON.stringify(selectedStaff)}</p>
          ) : (
            <ul>
              {selectedStaff.courses.map(course => (
                <li key={course._id}>
                  {course.name} ({course.code})
                  <button onClick={() => removeCourse(selectedStaff._id, course._id)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
            <h4>Available Courses</h4>
            <ul>
              {courses
                .filter(course => !selectedStaff.courses.some(c => c._id === course._id))
                .map(course => (
                  <li key={course._id}>
                    {course.name} ({course.code})
                    <button onClick={() => assignCourse(selectedStaff._id, course._id)}>Assign</button>
                  </li>
                ))}
            </ul>
            <button onClick={() => setSelectedStaff(null)}>Close</button>
          </div>
        )}
      </div>

      <div>
        <h2>Timetables</h2>
        <form onSubmit={createTimetable}>
          <input
            placeholder="Name"
            value={newTimetable.name}
            onChange={(e) => setNewTimetable({...newTimetable, name: e.target.value})}
            required
          />
          <input
            placeholder="Description"
            value={newTimetable.description}
            onChange={(e) => setNewTimetable({...newTimetable, description: e.target.value})}
          />
          <input
            type="number"
            placeholder="Hours Per Day"
            value={newTimetable.hoursPerDay}
            onChange={(e) => setNewTimetable({...newTimetable, hoursPerDay: Number(e.target.value)})}
            min="1"
            max="12"
            required
          />
          <button type="submit">Create Timetable</button>
        </form>
        <ul>
          {timetables.map(timetable => (
            <li key={timetable._id}>
              {timetable.name}
              <button onClick={() => generateTimetable(timetable._id)}>Generate</button>
              <button onClick={() => setSelectedTimetable(timetable)}>View</button>
              <button onClick={() => deleteTimetable(timetable._id)}>Delete</button>
            </li>
          ))}
        </ul>
        
        {selectedTimetable && (
          <div>
            <h3>Timetable: {selectedTimetable.name}</h3>
            {selectedTimetable.schedule?.map((day, dayIndex) => (
              <div key={dayIndex}>
                <h4>{day.day}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Course</th>
                      <th>Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.slots.map((slot, slotIndex) => (
                      <tr key={slotIndex}>
                        <td>{slot.time.start} - {slot.time.end}</td>
                        <td>{slot.course ? slot.course.name : 'Free'}</td>
                        <td>{slot.staff ? slot.staff.name : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button onClick={() => setSelectedTimetable(null)}>Close</button>
          </div>
        )}
      </div>
    </main>
  );
}