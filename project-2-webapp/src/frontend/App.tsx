import { useState, useEffect } from "react";
import { SearchForm } from "./components/SearchForm";
import { TripList } from "./components/TripList";
import { TripSidebar } from "./components/TripSidebar";
import { Trip } from "./types";
import "./App.css";

function App() {
	const [trips, setTrips] = useState<Trip[]>([]);
	const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchTrips();
	}, []);

	const fetchTrips = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/trips");
			const data = await response.json();
			setTrips(data);
			if (data.length > 0) {
				setSelectedTrip(data[0]);
			}
		} catch (error) {
			console.error("Error fetching trips:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (from: string, to: string, date: string) => {
		console.log("Searching:", { from, to, date });
		fetchTrips();
	};

	const handleSelectTrip = (trip: Trip) => {
		setSelectedTrip(trip);
	};

	const handleCloseDetail = () => {
		setSelectedTrip(null);
	};

	return (
		<>
			<div className={`app-container ${selectedTrip ? 'sidebar-open' : ''}`}>
				<SearchForm onSearch={handleSearch} />
				{loading ? (
					<div className="loading">Loading trips...</div>
				) : (
					<TripList trips={trips} onSelectTrip={handleSelectTrip} />
				)}
			</div>
			<TripSidebar trip={selectedTrip} onClose={handleCloseDetail} />
		</>
	);
}

export default App;
