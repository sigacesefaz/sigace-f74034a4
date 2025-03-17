
// This shared module contains common DataJud API functions

// Function to search processes by number in a specific court
export async function searchProcesses(courtEndpoint: string, processNumber: string): Promise<any[]> {
  try {
    const url = `${courtEndpoint}/consulta/processo/${processNumber}`;
    
    console.log(`Searching process at: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataJud API error: ${response.status} - ${errorText}`);
      throw new Error(`DataJud API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error("Error searching processes:", error);
    throw error;
  }
}

// Function to get a specific process by ID
export async function getProcessById(courtEndpoint: string, processNumber: string): Promise<any[]> {
  try {
    const hits = await searchProcesses(courtEndpoint, processNumber);
    return hits;
  } catch (error) {
    console.error("Error getting process by ID:", error);
    throw error;
  }
}
