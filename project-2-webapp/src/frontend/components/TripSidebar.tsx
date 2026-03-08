import { useState } from "react";
import { genQrImage } from "@tapple.io/qr-code-generator";
import { Trip } from "../types";
import { BoardingPassPopup } from "./BoardingPassPopup";
import "./TripSidebar.css";

interface TripSidebarProps {
	trip: Trip | null;
	onClose: () => void;
}

export function TripSidebar({ trip, onClose }: TripSidebarProps) {
	const [showBoardingPass, setShowBoardingPass] = useState(false);
	const [isPurchasing, setIsPurchasing] = useState(false);
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

	if (!trip) return null;

	const handlePurchase = async () => {
		setIsPurchasing(true);
		
		try {
			// Generate QR code with trip information
			const qrData = `https://example.com/ticket/${trip.id}`;
			const qrDataUrl = await genQrImage(qrData, {
				output: { format: 'png', type: 'dataURL' }
			}) as string;
			
			setQrCodeDataUrl(qrDataUrl);
			
			// Trigger workflow to generate PDF and upload to R2
			const response = await fetch("/api/purchase-ticket", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tripId: trip.id,
					qrCodeDataUrl: qrDataUrl,
					tripDetails: {
						from: trip.fromLocation,
						to: trip.toLocation,
						departureDate: trip.departureDate,
						returnDate: trip.returnDate,
						fare: trip.fare,
						ageCategory: trip.ageCategory
					}
				})
			});
			
			if (!response.ok) {
				throw new Error("Failed to process ticket purchase");
			}
			
			await new Promise(resolve => setTimeout(resolve, 2000));
			setShowBoardingPass(true);
		} catch (error) {
			console.error("Error generating QR code:", error);
		} finally {
			setIsPurchasing(false);
		}
	};

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

	return (
		<>
			<div className="trip-sidebar">
				<button className="sidebar-close-btn" onClick={onClose}>×</button>
				
				<div className="sidebar-header">
					<span className="travel-date">{formatDate(trip.departureDate)}</span>
					<div className="sidebar-time">
						<span className="time-large">{formatTime(trip.departureDate)}</span>
						<span className="time-arrow">→</span>
						<span className="time-large">{formatTime(trip.returnDate)}</span>
					</div>
				</div>

				<div className="sidebar-section">
					<h3>Economy Class</h3>
					<div className="class-tabs">
						<button className="class-tab active">Economy</button>
						<button className="class-tab">Business</button>
					</div>
				</div>

				<div className="sidebar-section">
					<div className="price-section">
						<div className="price-info">
							<span className="badge-yellow">Cheapest</span>
							<span className="price-large">
								Total Rp. {trip.fare.toFixed(0)}<sup>00</sup>
							</span>
						</div>
					</div>
				</div>

				<button 
					className="purchase-btn" 
					onClick={handlePurchase}
					disabled={isPurchasing}
				>
					{isPurchasing ? (
						<>
							<span className="spinner"></span>
							Processing...
						</>
					) : (
						"Purchase Ticket"
					)}
				</button>

			</div>

			{showBoardingPass && (
				<BoardingPassPopup 
					trip={trip}
					qrCodeDataUrl={qrCodeDataUrl}
					onClose={() => setShowBoardingPass(false)} 
				/>
			)}
		</>
	);
}
