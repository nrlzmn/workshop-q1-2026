import { Trip } from "../types";
import "./BoardingPassPopup.css";

interface BoardingPassPopupProps {
	trip: Trip;
	qrCodeDataUrl: string;
	onClose: () => void;
}

export function BoardingPassPopup({ trip, qrCodeDataUrl, onClose }: BoardingPassPopupProps) {
	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const generateSeatNumber = () => {
		const row = Math.floor(Math.random() * 20) + 1;
		const seat = String.fromCharCode(65 + Math.floor(Math.random() * 4));
		return `${row}${seat}`;
	};

	return (
		<div className="boarding-pass-overlay" onClick={onClose}>
			<div className="boarding-pass-popup" onClick={(e) => e.stopPropagation()}>
				<button className="popup-close-btn" onClick={onClose}>×</button>
				
				<h1 className="popup-title">Boarding Pass QR</h1>
				
				<div className="qr-code-container">
					{qrCodeDataUrl ? (
						<img src={qrCodeDataUrl} alt="QR Code" className="qr-code-image" />
					) : (
						<div className="qr-code-loading">Generating QR Code...</div>
					)}
				</div>

				<div className="trip-details-section">
					<h2>Trip Details</h2>
					<ul className="trip-details-list">
						<li>
							<strong>Trip ID:</strong> {trip.id}
						</li>
						<li>
							<strong>Date:</strong> {formatDate(trip.departureDate)}
						</li>
						<li>
							<strong>Time:</strong> {formatTime(trip.departureDate)} - {formatTime(trip.returnDate)}
						</li>
						<li>
							<strong>Seat:</strong> {generateSeatNumber()}
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
