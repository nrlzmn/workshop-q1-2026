import { Trip } from "../types";
import "./TripList.css";

interface TripListProps {
	trips: Trip[];
	onSelectTrip: (trip: Trip) => void;
}

export function TripList({ trips, onSelectTrip }: TripListProps) {
	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	};

	const calculateDuration = (departure: string, arrival: string) => {
		const dep = new Date(departure);
		const arr = new Date(arrival);
		const diff = arr.getTime() - dep.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	};

	return (
		<div className="trip-list">
			<div className="trips-container">
				{trips.map((trip) => (
					<div 
						key={trip.id} 
						className="trip-card"
						onClick={() => onSelectTrip(trip)}
					>
						<div className="trip-time-info">
							<div className="time-block">
								<span className="time">{formatTime(trip.departureDate)}</span>
								<span className="location">{trip.fromLocation}</span>
							</div>
							<div className="duration">
								<span>{calculateDuration(trip.departureDate, trip.returnDate)}</span>
								<div className="duration-line"></div>
							</div>
							<div className="time-block">
								<span className="time">{formatTime(trip.returnDate)}</span>
								<span className="location">{trip.toLocation}</span>
							</div>
						</div>

						<div className="trip-details">
							<span className="trip-type">Direct</span>
							<span className="trip-speed badge-orange">High-speed</span>
							<span className="trip-class badge-yellow">Cheapest</span>
						</div>

						<div className="trip-price">
							<span className="price">Rp. {trip.fare.toFixed(0)}<sup>00</sup></span>
							<span className="currency"></span>
						</div>
					</div>
				))}
			</div>

			<div className="promo-banner">
				<div className="promo-content">
					<h3>🎒 No Luggage Fees Ever</h3>
					<p>3 bags Always Included</p>
				</div>
			</div>
		</div>
	);
}
