export interface Trip {
	id: number;
	departureDate: string;
	fromLocation: string;
	returnDate: string;
	toLocation: string;
	fare: number;
	ageCategory: "adult" | "child";
}
