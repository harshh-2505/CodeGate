import React, { useState, useEffect, useMemo } from 'react';

// The base URL for your PHP API
const API_URL = 'http://localhost/codegate/api'; // Change this if your setup is different

// --- ICONS (Inline SVGs to avoid external dependencies) ---
const CalendarIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>;
const ClockIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MapPinIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const TicketIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>;
const UserIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogOutIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>;
const ArrowLeftIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const DollarSignIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const RepeatIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>;
const QrCodeIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16h.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/></svg>;
const SearchIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>;
const PlusCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="16"></line><line x1="8" x2="16" y1="12" y2="12"></line></svg>;


// --- Main App Component ---
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState('login'); // 'login', 'signup', 'home', 'eventDetails', 'myTickets', 'resale', 'addEvent'
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [events, setEvents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('date');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- DATA FETCHING ---
    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/events.php`);
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            setError("Could not load event data. Please ensure the backend server is running correctly.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTickets = async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`${API_URL}/tickets.php?userId=${userId}`);
             if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            const data = await response.json();
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            setError("Could not load your ticket data. Please try again later.");
        }
    };

    useEffect(() => {
        // Load QR code script and initial events
        const scriptId = 'qrcode-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
            script.async = true;
            document.body.appendChild(script);
        }
        fetchEvents();
    }, []);

    useEffect(() => {
        // Fetch tickets when user logs in
        if (currentUser) {
            fetchTickets(currentUser.id);
        } else {
            setTickets([]); // Clear tickets on logout
        }
    }, [currentUser]);


    const navigate = (newPage, eventId = null) => {
        setPage(newPage);
        setSelectedEventId(eventId);
        window.scrollTo(0, 0);
    };

    // --- API HANDLERS ---
    const handleLogin = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.success) {
                setCurrentUser(data.user);
                navigate('home');
            }
            return data;
        } catch (error) {
            return { success: false, message: 'Could not connect to the server.' };
        }
    };

    const handleSignup = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/signup.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (data.success) {
                setCurrentUser(data.user);
                navigate('home');
            }
            return data;
        } catch (error) {
            return { success: false, message: 'Could not connect to the server.' };
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        navigate('login');
    };

    const handleBuyTicket = async (event) => {
      if (!currentUser || currentUser.type !== 'customer') {
          alert("Please log in as a customer to buy tickets.");
          return;
      }
      try {
          const response = await fetch(`${API_URL}/tickets.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventId: event.id, ownerId: currentUser.id }),
          });
          const data = await response.json();
          if(data.success) {
              await fetchTickets(currentUser.id); // Refresh tickets
              alert(`Successfully purchased ticket for ${event.name}!`);
              navigate('myTickets');
          } else {
               alert(`Failed to purchase ticket: ${data.message}`);
          }
      } catch (error) {
          alert("An error occurred while purchasing the ticket.");
      }
    };
    
    const handleResellTicket = async (ticketId, price) => {
        try {
            await fetch(`${API_URL}/tickets.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId, isForResale: 1, resalePrice: price }),
            });
            await fetchTickets(currentUser.id); // Refresh tickets
        } catch (error) {
            alert("An error occurred while listing the ticket for resale.");
        }
    };

    const handleCancelResell = async (ticketId) => {
         try {
            await fetch(`${API_URL}/tickets.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId, isForResale: 0, resalePrice: null }),
            });
            await fetchTickets(currentUser.id); // Refresh tickets
        } catch (error) {
            alert("An error occurred while canceling the resale.");
        }
    };

    const handleBuyResoldTicket = (ticket) => {
        // This would be a new API endpoint in a real app to handle the transaction securely
        // For now, we simulate it on the client after a confirmation
        alert(`This would normally trigger a secure purchase flow. For this demo, we will transfer the ticket directly.`);
        setTickets(tickets.map(t => 
          t.id === ticket.id ? { ...t, ownerId: currentUser.id, isForResale: false, resalePrice: 0 } : t
        ));
        navigate('myTickets');
    };
    
    const handleCreateEvent = async (newEventData) => {
        const payload = {
            ...newEventData,
            organizerId: currentUser.id,
            image: `https://placehold.co/600x400/6d28d9/ffffff?text=${newEventData.name.replace(/\s/g, '+')}`,
        };
        try {
            await fetch(`${API_URL}/events.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            await fetchEvents(); // Refresh events list
            navigate('home');
        } catch (error) {
             alert("An error occurred while creating the event.");
        }
    };
    // --- END API HANDLERS ---

    const filteredEvents = useMemo(() => {
        return events
            .filter(event => {
                const searchTermLower = searchTerm.toLowerCase();
                return (
                    event.name.toLowerCase().includes(searchTermLower) ||
                    event.location.toLowerCase().includes(searchTermLower) ||
                    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
                );
            })
            .sort((a, b) => {
                if (filter === 'date') {
                    return new Date(a.date) - new Date(b.date);
                } else if (filter === 'price') {
                    return a.price - b.price;
                }
                return 0;
            });
    }, [events, searchTerm, filter]);

    const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);
    
    const renderPage = () => {
        if (isLoading) {
            return <div className="text-center p-20 text-xl">Loading...</div>;
        }

        if (error) {
            return (
                <div className="text-center p-10 bg-red-900/20 border border-red-500/50 rounded-lg max-w-2xl mx-auto my-10">
                    <h2 className="text-3xl font-bold text-red-400 mb-4">Connection Error</h2>
                    <p className="text-red-300 mb-4">{error}</p>
                    <p className="text-gray-400 text-sm">Please ensure your Apache & MySQL server is running and the API is accessible at <code className="bg-gray-700 p-1 rounded">{API_URL}</code>. Check the browser console (F12) for more specific errors like CORS issues.</p>
                </div>
            );
        }
        
        switch (page) {
            case 'login':
                return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
            case 'signup':
                return <SignupPage onSignup={handleSignup} onNavigate={navigate} />;
            case 'home':
                if (currentUser?.type === 'organizer') {
                    const organizerEvents = events.filter(e => e.organizerId === currentUser.id);
                    return <OrganizerDashboardPage events={organizerEvents} onSelectEvent={(id) => navigate('eventDetails', id)} onAddNew={() => navigate('addEvent')} />;
                }
                return <HomePage 
                            events={filteredEvents} 
                            onSelectEvent={(id) => navigate('eventDetails', id)} 
                            currentUser={currentUser}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filter={filter}
                            setFilter={setFilter} 
                        />;
            case 'eventDetails':
                return selectedEvent ? <EventDetailsPage event={selectedEvent} onBack={() => navigate('home')} onBuyTicket={handleBuyTicket} currentUser={currentUser} /> : <HomePage events={events} onSelectEvent={(id) => navigate('eventDetails', id)} />;
            case 'myTickets':
                return <MyTicketsPage tickets={tickets} onResell={handleResellTicket} onCancelResell={handleCancelResell} />;
            case 'resale':
                // In a real app, this data would come from a separate API call
                const resaleTickets = events.reduce((acc, event) => {
                    const eventTicketsForResale = tickets.filter(t => t.isForResale && t.eventId === event.id && t.ownerId !== currentUser?.id);
                    return [...acc, ...eventTicketsForResale];
                }, []);
                return <ResaleMarketPage tickets={resaleTickets} onBuy={handleBuyResoldTicket}/>;
            case 'addEvent':
                return <AddEventPage onAddEvent={handleCreateEvent} onBack={() => navigate('home')} />;
            default:
                return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header currentUser={currentUser} onLogout={handleLogout} navigate={navigate} />
            <main className="container mx-auto px-4 py-8">
                {renderPage()}
            </main>
             <Footer />
        </div>
    );
}

// All sub-components (Header, Footer, Pages, Cards, etc.) remain the same as the previous version.
// ... (Paste all the LAYOUT, PAGE, and REUSABLE components from the previous version here)
// --- LAYOUT COMPONENTS ---
const Header = ({ currentUser, onLogout, navigate }) => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 onClick={() => navigate('home')} className="text-3xl font-bold tracking-wider cursor-pointer text-purple-400">
                    CODEGATE
                </h1>
                <div className="flex items-center space-x-6">
                    {currentUser ? (
                        <>
                             <span className="text-gray-300">Welcome, {currentUser.name}</span>
                            {currentUser.type === 'customer' && (
                                <>
                                    <button onClick={() => navigate('myTickets')} className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                                        <TicketIcon className="w-5 h-5" /> <span>My Tickets</span>
                                    </button>
                                     <button onClick={() => navigate('resale')} className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                                        <RepeatIcon className="w-5 h-5" /> <span>Resale Market</span>
                                    </button>
                                </>
                            )}
                            {currentUser.type === 'organizer' && (
                                <button onClick={() => navigate('home')} className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
                                    <UserIcon className="w-5 h-5" /> <span>Dashboard</span>
                                </button>
                            )}
                            <button onClick={onLogout} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                                <LogOutIcon className="w-5 h-5" /> <span>Logout</span>
                            </button>
                        </>
                    ) : (
                         <div className="text-gray-400">Welcome to the future of ticketing.</div>
                    )}
                </div>
            </nav>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-gray-900 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CODEGATE. All rights reserved.</p>
            <p className="text-sm mt-1">Secure & Fair Ticketing Platform.</p>
        </div>
    </footer>
);

// --- PAGE COMPONENTS ---
const LoginPage = ({ onLogin, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await onLogin(email, password);
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700">
                <h2 className="text-4xl font-bold text-center mb-2 text-purple-400">Welcome Back</h2>
                <p className="text-center text-gray-400 mb-8">Sign in to your CODEGATE account</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Login
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">
                    Don't have an account?{' '}
                    <button onClick={() => onNavigate('signup')} className="font-semibold text-purple-400 hover:text-purple-300">
                        Sign Up
                    </button>
                </p>
                 <p className="text-center text-xs text-gray-500 mt-4">
                    Demo Account: `organizer@codegate.com`. Password is `password123`.
                </p>
            </div>
        </div>
    );
};

const SignupPage = ({ onSignup, onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [type, setType] = useState('customer');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        const result = await onSignup({ name, email, password, type });
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700">
                <h2 className="text-4xl font-bold text-center mb-2 text-purple-400">Create Account</h2>
                <p className="text-center text-gray-400 mb-8">Join CODEGATE and start your next adventure.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Alex Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Password</label>
                        <input 
                            type="password" 
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                         <label className="text-sm font-bold text-gray-300 block mb-2">Account Type</label>
                         <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                         >
                            <option value="customer">Customer</option>
                            <option value="organizer">Event Organizer</option>
                         </select>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                    
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors mt-4 !mt-6">
                        Create Account
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="font-semibold text-purple-400 hover:text-purple-300">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};


const HomePage = ({ events, onSelectEvent, currentUser, searchTerm, setSearchTerm, filter, setFilter }) => {
    const featuredEvents = events.filter(e => e.isFeatured);
    const regularEvents = events.filter(e => !e.isFeatured);

    return (
    <div>
        {featuredEvents.length > 0 && (
            <div className="mb-12">
                <h2 className="text-4xl font-bold mb-6">Featured Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featuredEvents.map(event => (
                        <FeaturedEventCard key={event.id} event={event} onSelectEvent={onSelectEvent} />
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-4xl font-bold">All Events</h2>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon className="w-5 h-5"/>
                    </span>
                </div>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="date">Sort by Date</option>
                    <option value="price">Sort by Price</option>
                </select>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularEvents.map(event => (
                <EventCard key={event.id} event={event} onSelectEvent={onSelectEvent} />
            ))}
        </div>
        {events.length === 0 && searchTerm && (
            <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700 col-span-full">
                <p className="text-gray-400">No events found for "{searchTerm}".</p>
            </div>
        )}
    </div>
    )
};

const EventDetailsPage = ({ event, onBack, onBuyTicket, currentUser }) => {
    const { name, date, time, location, description, price, organizerName, image, tags } = event;
    const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-6">
                <ArrowLeftIcon className="w-5 h-5"/>
                <span>Back to Events</span>
            </button>
            <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
                <img src={image} alt={name} className="w-full h-64 object-cover" />
                <div className="p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags && tags.map(tag => (
                            <span key={tag} className="bg-purple-900/50 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                    <h2 className="text-4xl font-bold mb-4">{name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300 mb-6">
                        <div className="flex items-center space-x-3"><CalendarIcon className="w-5 h-5 text-purple-400" /> <span>{formattedDate}</span></div>
                        <div className="flex items-center space-x-3"><ClockIcon className="w-5 h-5 text-purple-400" /> <span>{time}</span></div>
                        <div className="flex items-center space-x-3"><MapPinIcon className="w-5 h-5 text-purple-400" /> <span>{location}</span></div>
                    </div>
                    <p className="text-gray-400 leading-relaxed mb-6">{description}</p>
                    <div className="text-sm text-gray-500 mb-8">Organized by: {organizerName}</div>
                    
                    {currentUser?.type === 'customer' && (
                        <div className="bg-gray-700/50 p-6 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-gray-400">Ticket Price</p>
                                <p className="text-3xl font-bold text-white">${Number(price).toFixed(2)}</p>
                            </div>
                            <button onClick={() => onBuyTicket(event)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                                Buy Ticket
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyTicketsPage = ({ tickets, onResell, onCancelResell }) => (
    <div>
        <h2 className="text-4xl font-bold mb-8">My Tickets</h2>
        {tickets.length > 0 ? (
            <div className="space-y-6">
                {tickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} onResell={onResell} onCancelResell={onCancelResell} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700">
                <TicketIcon className="w-12 h-12 mx-auto text-gray-500" />
                <p className="mt-4 text-gray-400">You don't have any tickets yet.</p>
                <p className="text-sm text-gray-500">Go explore some events!</p>
            </div>
        )}
    </div>
);

const OrganizerDashboardPage = ({ events, onSelectEvent, onAddNew }) => (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold">My Listed Events</h2>
            <button onClick={onAddNew} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                <PlusCircleIcon className="w-6 h-6"/>
                <span>Create New Event</span>
            </button>
        </div>
        {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <EventCard key={event.id} event={event} onSelectEvent={onSelectEvent} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700">
                <TicketIcon className="w-12 h-12 mx-auto text-gray-500" />
                <p className="mt-4 text-gray-400">You haven't created any events yet.</p>
                <p className="text-sm text-gray-500">Click "Create New Event" to get started.</p>
            </div>
        )}
    </div>
);

const AddEventPage = ({ onAddEvent, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        location: '',
        description: '',
        price: '',
        tags: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            price: parseFloat(formData.price),
            tags: formData.tags.split(',').map(tag => tag.trim()),
        };
        onAddEvent(finalData);
    };

    return (
         <div className="max-w-2xl mx-auto">
             <button onClick={onBack} className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-6">
                <ArrowLeftIcon className="w-5 h-5"/>
                <span>Back to Dashboard</span>
            </button>
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700">
                <h2 className="text-3xl font-bold mb-6">Create a New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Event Name</label>
                            <input type="text" name="name" onChange={handleChange} value={formData.name} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Location</label>
                            <input type="text" name="location" onChange={handleChange} value={formData.location} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Date</label>
                            <input type="date" name="date" onChange={handleChange} value={formData.date} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Time</label>
                            <input type="time" name="time" onChange={handleChange} value={formData.time} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Price ($)</label>
                            <input type="number" name="price" step="0.01" onChange={handleChange} value={formData.price} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Tags (comma-separated)</label>
                            <input type="text" name="tags" onChange={handleChange} value={formData.tags} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., Music, Festival"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-300 block mb-2">Description</label>
                        <textarea name="description" rows="4" onChange={handleChange} value={formData.description} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                    </div>
                    <div className="flex justify-end">
                         <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
         </div>
    );
};

const ResaleMarketPage = ({ tickets, onBuy }) => (
     <div>
        <h2 className="text-4xl font-bold mb-2">Resale Market</h2>
        <p className="text-gray-400 mb-8">Securely buy tickets from other fans.</p>
        {tickets.length > 0 ? (
            <div className="space-y-6">
                {tickets.map(ticket => (
                   <div key={ticket.id} className="bg-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border border-gray-700">
                       <div className="mb-4 md:mb-0">
                           <h3 className="font-bold text-xl">{ticket.eventDetails.name}</h3>
                           <p className="text-sm text-gray-400">{new Date(ticket.eventDetails.date).toLocaleDateString()}</p>
                           <p className="text-sm text-gray-400">{ticket.eventDetails.location}</p>
                       </div>
                       <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Resale Price</p>
                            <p className="text-2xl font-bold">${Number(ticket.resalePrice).toFixed(2)}</p>
                          </div>
                           <button onClick={() => onBuy(ticket)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                               Buy Now
                           </button>
                       </div>
                   </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700">
                <RepeatIcon className="w-12 h-12 mx-auto text-gray-500"/>
                <p className="mt-4 text-gray-400">No tickets are currently available for resale.</p>
                <p className="text-sm text-gray-500">Check back later!</p>
            </div>
        )}
    </div>
);


// --- REUSABLE COMPONENTS ---
const FeaturedEventCard = ({ event, onSelectEvent }) => {
    const { id, name, date, location, image, description } = event;
    const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div onClick={() => onSelectEvent(id)} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer group border border-gray-700 hover:border-purple-500 transition-all duration-300 flex flex-col md:flex-row">
            <img src={image} alt={name} className="w-full md:w-1/3 h-48 md:h-full object-cover" />
            <div className="p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{name}</h3>
                    <p className="text-sm text-gray-400 mb-1">{formattedDate}</p>
                    <p className="text-sm text-gray-400 mb-4 flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{location}</span>
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed hidden md:block">{description.substring(0, 100)}...</p>
                </div>
                <div className="mt-4 text-purple-400 font-semibold">
                    View Details &rarr;
                </div>
            </div>
        </div>
    );
};

const EventCard = ({ event, onSelectEvent }) => {
    const { id, name, date, location, image } = event;
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div onClick={() => onSelectEvent(id)} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer group border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative">
                <img src={image} alt={name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 bg-gray-900/70 text-white text-sm font-bold px-3 py-1 rounded-full">{formattedDate}</div>
            </div>
            <div className="p-5">
                <h3 className="text-xl font-bold mb-2 truncate group-hover:text-purple-400 transition-colors">{name}</h3>
                <p className="text-sm text-gray-400 flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{location}</span>
                </p>
            </div>
        </div>
    );
};

const QRCode = ({ data }) => {
    const [qrImage, setQrImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateQrCode = () => {
            if (typeof qrcode !== 'undefined') {
                try {
                    const qr = qrcode(0, 'M');
                    qr.addData(data);
                    qr.make();
                    const imgTag = qr.createDataURL(5, 5);
                    setQrImage(imgTag);
                    setIsLoading(false);
                } catch (error) {
                    console.error("QR Code generation failed:", error);
                    setIsLoading(false);
                }
            }
        };

        const interval = setInterval(() => {
            if (typeof qrcode !== 'undefined') {
                clearInterval(interval);
                generateQrCode();
            }
        }, 100);
        return () => clearInterval(interval);

    }, [data]);

    if (isLoading) {
        return <div className="w-40 h-40 bg-gray-600 animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-400 p-2 text-center">Generating Secure QR Code...</div>;
    }

    return qrImage ? <img src={qrImage} alt="Event QR Code" className="w-40 h-40" /> : <div className="w-40 h-40 flex items-center justify-center">Failed to load QR code.</div>;
};

const TicketCard = ({ ticket, onResell, onCancelResell }) => {
    const { eventDetails } = ticket;
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [isResellModalOpen, setIsResellModalOpen] = useState(false);
    const [resellPrice, setResellPrice] = useState(eventDetails.price);

    const qrData = `Event Name: ${eventDetails.name}\nVenue: ${eventDetails.location}\nTiming: ${new Date(eventDetails.date).toDateString()} at ${eventDetails.time}\nTicket ID: ${ticket.id}`;

    useEffect(() => {
        const eventDateTime = new Date(`${eventDetails.date}T${eventDetails.time}`);
        const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);

        const updateTimer = () => {
            const now = new Date();
            if (now >= eventDateTime) {
                 setIsUnlocked(true);
                 setTimeLeft('Event Started');
            } else if (now >= oneHourBefore) {
                setIsUnlocked(true);
                setTimeLeft('Unlocked!');
            } else {
                const diff = oneHourBefore - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s until unlock`);
            }
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [eventDetails.date, eventDetails.time]);

    const handleResellSubmit = () => {
        onResell(ticket.id, parseFloat(resellPrice));
        setIsResellModalOpen(false);
    }
    
    return (
        <>
            <div className="bg-gray-800 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden border border-gray-700">
                <div className="flex-grow p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-purple-400">{eventDetails.organizerName}</p>
                        <h3 className="text-2xl font-bold mb-2">{eventDetails.name}</h3>
                        <div className="text-sm text-gray-400 space-y-1">
                            <p className="flex items-center space-x-2"><CalendarIcon className="w-4 h-4"/> <span>{new Date(eventDetails.date).toDateString()} at {eventDetails.time}</span></p>
                            <p className="flex items-center space-x-2"><MapPinIcon className="w-4 h-4"/> <span>{eventDetails.location}</span></p>
                        </div>
                    </div>
                    {!ticket.isForResale ? (
                      <button onClick={() => setIsResellModalOpen(true)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <RepeatIcon className="w-5 h-5"/> <span>Resell Ticket</span>
                      </button>
                    ) : (
                      <div className="mt-4 bg-green-900/50 text-green-300 p-3 rounded-lg flex justify-between items-center">
                          <span>Listed for resale at ${Number(ticket.resalePrice).toFixed(2)}</span>
                          <button onClick={() => onCancelResell(ticket.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-lg">Cancel</button>
                      </div>
                    )}
                </div>
                <div className="bg-gray-700 p-6 flex flex-col items-center justify-center w-full md:w-80">
                    <div className={`relative transition-all duration-500 ${!isUnlocked ? 'blur-lg' : ''}`}>
                         <QRCode data={qrData} />
                    </div>
                    <div className={`mt-4 text-center px-4 py-2 rounded-lg ${isUnlocked ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        <p className="font-bold text-sm">{timeLeft}</p>
                    </div>
                </div>
            </div>

            {isResellModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg max-w-sm w-full border border-gray-700">
                        <h3 className="font-bold text-2xl mb-4">Set Resale Price</h3>
                        <p className="text-gray-400 mb-6">Original price: ${Number(eventDetails.price).toFixed(2)}. Set a price to list this ticket on the Resale Market.</p>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><DollarSignIcon className="w-5 h-5"/></span>
                            <input 
                                type="number"
                                value={resellPrice}
                                onChange={(e) => setResellPrice(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg p-3 pl-10 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                step="0.01"
                                min="0.01"
                            />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={() => setIsResellModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleResellSubmit} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">List for Sale</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

