
export const BACKEND_URL="http://localhost:3000/api"

// Debug function to test different token formats
export const testTokenFormats = async (token: string) => {
  const formats = [
    { name: "Bearer format", header: `Bearer ${token}` },
    { name: "Token only", header: token },
    { name: "Lowercase bearer", header: `bearer ${token}` },
    { name: "No prefix", header: token.replace('Bearer ', '') }
  ];

  console.log("Testing different token formats...");
  
  for (const format of formats) {
    try {
      console.log(`Testing ${format.name}: ${format.header}`);
      const response = await fetch(`${BACKEND_URL}/content`, {
        method: 'GET',
        headers: {
          'Authorization': format.header,
          'Content-Type': 'application/json'
        }
      });
      console.log(`${format.name} - Status: ${response.status}`);
      if (response.ok) {
        console.log(`${format.name} - SUCCESS!`);
        return format;
      }
    } catch (error) {
      console.log(`${format.name} - Error:`, error);
    }
  }
  
  return null;
};

// Test backend connectivity
export const testBackendConnectivity = async () => {
  console.log("Testing backend connectivity...");
  console.log("Backend URL:", BACKEND_URL);
  
  try {
    // Test basic connectivity
    const response = await fetch(`${BACKEND_URL}/signin`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("OPTIONS request status:", response.status);
    console.log("OPTIONS response headers:", response.headers);
    
    // Test if the endpoint exists
    const testResponse = await fetch(`${BACKEND_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });
    console.log("POST test status:", testResponse.status);
    console.log("POST test response:", await testResponse.text());
    
    return {
      optionsWorks: response.status === 204,
      postEndpointExists: testResponse.status !== 404
    };
  } catch (error) {
    console.error("Backend connectivity test failed:", error);
    return {
      optionsWorks: false,
      postEndpointExists: false,
      error: error
    };
  }
};