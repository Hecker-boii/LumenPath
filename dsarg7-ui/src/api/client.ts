// Use your machine's IP address when testing on physical device
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost or 127.0.0.1
const BASE_URL = "http://127.0.0.1:8000"; // Change to your IP (e.g., "http://192.168.1.100:8000") for device testing

export async function getNext(learnerId: number) {
  try {
    const res = await fetch(`${BASE_URL}/learner/${learnerId}/next`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching next recommendation:', error);
    throw error;
  }
}

export async function interact(
  learnerId: number,
  conceptId: string,
  correct: boolean,
  timeSpent: number
) {
  try {
    const res = await fetch(`${BASE_URL}/learner/${learnerId}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: conceptId,
        correct,
        time_spent: timeSpent,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error recording interaction:', error);
    throw error;
  }
}
