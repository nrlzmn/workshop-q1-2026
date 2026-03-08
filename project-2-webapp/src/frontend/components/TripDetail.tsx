import { Trip } from "../types";
import "./TripDetail.css";

interface TripDetailProps {
	trip: Trip;
	onClose: () => void;
}

export function TripDetail({ trip, onClose }: TripDetailProps) {
	return (
		<div className="trip-detail-modal">
			<div className="trip-detail-content">
				<button className="close-btn" onClick={onClose}>×</button>
				<h2>Economy Class</h2>
				<div className="detail-price">
					<span className="detail-price-amount">{trip.fare.toFixed(0)}<sup>99</sup> USD</span>
					<span className="detail-badge">Cheapest</span>
				</div>
				
				<div className="detail-images">
					<img src="https://via.placeholder.com/300x200?text=Train+Interior" alt="Train interior" />
					<img src="https://via.placeholder.com/300x200?text=Train+Exterior" alt="Train exterior" />
				</div>

				<div className="detail-info">
					<p><strong>Class:</strong> Economy & Refunds</p>
					<p><strong>Luggage:</strong> 3 bags included</p>
				</div>

				<button className="select-btn">Select and go to Passengers</button>
			</div>
		</div>
	);
}
