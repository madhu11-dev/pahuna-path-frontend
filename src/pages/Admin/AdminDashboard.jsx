import React, { useState, useMemo } from "react";
import { Users, MapPin, BarChart3, Settings, Bell, Search, Trash2, Menu, X, Star } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// --- Nepali Names & Users ---
const nepaliNames = ["Sujan", "Anisha", "Bikash", "Sita", "Ram", "Gita", "Hari", "Rupa", "Dipesh", "Pooja"];
const userImages = [
  "https://i.pinimg.com/736x/ec/4a/75/ec4a751bfbd24c687d22aaf37f9e0802.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQIVZGdb9DQHAX3LZB-OaNX3CAD6o3ll6b7XFr7RIxn54TEJ-h2UwtGLqmP4UihmQObAw&usqp=CAU"
];

// --- Places Data ---
const placesDataInitial = [
  { id: 1, name: "Mustang", category: "Adventure", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Kagdeni%2C_Mustang%2C_Nepal.jpg/1200px-Kagdeni%2C_Mustang%2C_Nepal.jpg", desc: "Breathtaking Himalayan views and remote villages." },
  { id: 2, name: "Botanical Garden", category: "Nature", image: "https://floristicsco.com/cdn/shop/articles/thumbnail_8ef199d5-f1dd-4194-9f86-30a31a5e902c_1024x1024.jpg?v=1760003529", desc: "A paradise of flora, perfect for relaxation." },
  { id: 3, name: "Pond", category: "Nature", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKn0mi-eAVttnF1BB3_PACn4Cg7uBzbwojZw&s", desc: "Serene water body for picnics and boat rides." },
  { id: 4, name: "Ansupa Lake", category: "Nature", image: "https://content.jdmagicbox.com/comp/cuttack/m3/0671px671.x671.190911015858.k7m3/catalogue/ansupa-lake-cuttack-city-cuttack-tourist-attraction-UM1bZ3YNi4.jpg", desc: "Beautiful lake surrounded by lush greenery." },
  { id: 5, name: "Dahapa Dam Trek", category: "Adventure", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGet82NNCtp7FC0WIMPmu34MO9eUy77FrE3g&s", desc: "Challenging trek with spectacular dam views." },
  { id: 6, name: "Lake Side Pokhara", category: "Nature", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ulwCrpCmfEBIiWutIVuxZG08AoFwjqiWTPvNaomnTK6EzKzlwMY8aXRf8GgQEs0m0jo&usqp=CAU", desc: "Popular lakeside area with restaurants and beautiful lake views." }
];

// --- Generate Users ---
const generateUsers = () => Array.from({ length: 10 }, (_, i) => ({
  id: i+1,
  name: nepaliNames[i % nepaliNames.length],
  email: `${nepaliNames[i % nepaliNames.length].toLowerCase()}${i}@example.com`,
  role: i === 0 ? "Admin" : "User", // Only one admin
  avatar: userImages[i % userImages.length],
  isBanned: i % 5 === 0
}));

// --- Generate Visits ---
const generateVisits = (users, places) => {
  const visits = [];
  for(let i=0;i<30;i++){
    const user = users[i % users.length];
    const place = places[i % places.length];
    visits.push({
      id: i+1,
      user,
      place,
      date: `2025-${String((i%12)+1).padStart(2,'0')}-` + String(10+(i%20)).padStart(2,'0'),
      stars: Math.floor(Math.random()*5)+1
    });
  }
  return visits;
};

// --- Reported Comments ---
const reportedComments = [
  { id: 1, user: "Bikash", comment: "Inappropriate image" },
  { id: 2, user: "Gita", comment: "Spam comment here" }
];

// --- Admin Dashboard ---
const AdminDashboard = () => {
  const [activeTab,setActiveTab]=useState("dashboard");
  const [isSidebarOpen,setIsSidebarOpen]=useState(false);
  const [usersData,setUsersData]=useState(generateUsers());
  const [placesData,setPlacesData]=useState(placesDataInitial);
  const [visitsData]=useState(generateVisits(usersData,placesData));
  const [showBanned,setShowBanned]=useState(false);
  const [showVisitors,setShowVisitors]=useState(false);
  const [showComments,setShowComments]=useState(false);

  // Stats
  const stats = useMemo(()=>[
    { title: "Total Users", value: usersData.length },
    { title: "Total Visitors", value: visitsData.length },
    { title: "Reported Comments", value: reportedComments.length },
    { title: "Banned Users", value: usersData.filter(u=>u.isBanned).length }
  ],[usersData,visitsData]);

  // Visitor graph per month
  const visitorGraphData = Array.from({length:12},(_,i)=>({
    month: new Date(2025,i,1).toLocaleString('default',{month:'short'}),
    visits: Math.floor(Math.random()*20)+5
  }));

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-emerald-900 text-white flex flex-col z-50 transform transition-transform duration-300 shadow-2xl md:shadow-none ${isSidebarOpen?"translate-x-0":"-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 text-2xl font-extrabold border-b border-emerald-800 flex justify-between items-center">
          Admin Panel
          <button onClick={()=>setIsSidebarOpen(false)} className="md:hidden text-white/80 hover:text-white p-1 rounded"><X className="w-6 h-6"/></button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {["dashboard","places","visits","settings"].map(name=>(
            <button key={name} onClick={()=>{setActiveTab(name);setIsSidebarOpen(false)}} className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left transition duration-150 ${activeTab===name?"bg-emerald-700 text-white font-semibold shadow-inner":"hover:bg-emerald-700/60 text-emerald-100"}`}>
              {name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 space-y-6">
        {/* Dashboard */}
        {activeTab==="dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((s,i)=>(
                <div key={i} className="p-6 bg-white rounded-xl shadow-lg flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-full"><Users className="w-6 h-6 text-emerald-700"/></div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{s.title}</p>
                    <p className="font-extrabold text-3xl text-emerald-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-emerald-800 mb-4">Visitors Graph 2025</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={visitorGraphData}>
                  <CartesianGrid stroke="#ccc"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="visits" stroke="#22c55e" strokeWidth={3}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Places */}
        {activeTab==="places" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placesData.map(p=>(
              <div key={p.id} className="bg-white shadow-lg rounded-xl overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover"/>
                <div className="p-4">
                  <p className="font-bold text-lg text-gray-900">{p.name}</p>
                  <p className="text-gray-600 text-sm mb-2">{p.desc}</p>
                  <p className="text-sm text-gray-500">Category: {p.category}</p>
                  <p className="text-sm text-gray-500 mt-1">Visitors: {visitsData.filter(v=>v.place.name===p.name).length}</p>
                  <p className="text-yellow-400 mt-1 flex gap-1">
                    {Array.from({length:Math.round(visitsData.filter(v=>v.place.name===p.name).reduce((acc,v)=>acc+v.stars,0)/Math.max(1,visitsData.filter(v=>v.place.name===p.name).length))}).map((_,i)=><Star key={i} className="w-4 h-4 fill-current"/>)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visits */}
        {activeTab==="visits" && (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Stars</th>
                </tr>
              </thead>
              <tbody>
                {visitsData.map(v=>(
                  <tr key={v.id} className="hover:bg-emerald-50/20">
                    <td className="px-4 py-2">{v.id}</td>
                    <td className="px-4 py-2 flex items-center gap-2"><img src={v.user.avatar} className="w-6 h-6 rounded-full"/>{v.user.name}</td>
                    <td className="px-4 py-2">{v.place.name}</td>
                    <td className="px-4 py-2">{v.date}</td>
                    <td className="px-4 py-2 flex gap-1 text-yellow-400">{Array.from({length:v.stars}).map((_,i)=><Star key={i} className="w-4 h-4 fill-current"/>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings */}
        {activeTab==="settings" && (
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="font-bold text-xl text-emerald-800">Settings Overview</h2>

            <button onClick={()=>setShowBanned(!showBanned)} className="w-full text-left px-4 py-2 bg-red-100 rounded-lg">
              Banned Users ({usersData.filter(u=>u.isBanned).length})
            </button>
            {showBanned && <ul className="pl-4 mt-2 space-y-1">{usersData.filter(u=>u.isBanned).map(u=><li key={u.id}>{u.name}</li>)}</ul>}

            <button onClick={()=>setShowVisitors(!showVisitors)} className="w-full text-left px-4 py-2 bg-green-100 rounded-lg">
              Total Visitors per Place
            </button>
            {showVisitors && <ul className="pl-4 mt-2 space-y-1">
              {placesData.map(p=><li key={p.id}>{p.name}: {visitsData.filter(v=>v.place.name===p.name).length} visitors</li>)}
            </ul>}

            <button onClick={()=>setShowComments(!showComments)} className="w-full text-left px-4 py-2 bg-yellow-100 rounded-lg">
              Reported Comments ({reportedComments.length})
            </button>
            {showComments && <ul className="pl-4 mt-2 space-y-1">
              {reportedComments.map(r=><li key={r.id}>{r.user}: {r.comment}</li>)}
            </ul>}
          </div>
        )}
      </main>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 md:hidden z-40" onClick={()=>setIsSidebarOpen(false)}></div>}
    </div>
  )
};

export default AdminDashboard;
