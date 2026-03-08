import { useState } from "react";
import "./SearchForm.css";

interface SearchFormProps {
	onSearch: (from: string, to: string, date: string) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
	const [from, setFrom] = useState("Stasiun Gambir");
	const [to, setTo] = useState("Stasiun Pasar Senen");
	const [date, setDate] = useState("2026-03-12");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(from, to, date);
	};

	return (
		<div className="search-container">
			<h1 className="title">Travel Hub</h1>
			<form className="search-form" onSubmit={handleSubmit}>
				<div className="form-row">
					<div className="form-field">
						<label>From</label>
						<input
							type="text"
							value={from}
							onChange={(e) => setFrom(e.target.value)}
							placeholder="From..."
						/>
					</div>
					<button type="button" className="swap-button">⇆</button>
					<div className="form-field">
						<label>To</label>
						<input
							type="text"
							value={to}
							onChange={(e) => setTo(e.target.value)}
							placeholder="To..."
						/>
					</div>
					<div className="form-field">
						<label>Date of journey</label>
						<input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>
				</div>
				<button type="submit" className="search-button">
					🔍 Search trip
				</button>
			</form>
		</div>
	);
}
