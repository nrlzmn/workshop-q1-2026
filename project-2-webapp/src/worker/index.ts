import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/trips", async (c) => {
	try {
		const db = c.env.D1;
		const { results } = await db.prepare("SELECT * FROM trip ORDER BY departureDate").all();
		
		const trips = results.map((row: any) => ({
			id: row.id,
			departureDate: row.departureDate,
			fromLocation: row.fromLocation,
			returnDate: row.returnDate,
			toLocation: row.toLocation,
			fare: row.fare,
			ageCategory: row.ageCategory
		}));
		
		return c.json(trips);
	} catch (error) {
		console.error("Error fetching trips from D1:", error);
		return c.json({ error: "Failed to fetch trips" }, 500);
	}
});

app.post("/api/purchase-ticket", async (c) => {
	try {
		const body = await c.req.json();
		const { tripId, qrCodeDataUrl, tripDetails } = body;
		
		// Trigger workflow
		const instance = await c.env.WORKFLOW_PROCESS_ORDER.create({
			params: {
				tripId,
				qrCodeDataUrl,
				tripDetails,
				timestamp: Date.now()
			}
		});
		
		return c.json({ 
			success: true, 
			workflowId: instance.id 
		});
	} catch (error) {
		console.error("Error triggering workflow:", error);
		return c.json({ error: "Failed to process ticket purchase" }, 500);
	}
});

export default app;

export { ProcessOrder } from "./workflows/process-order";
