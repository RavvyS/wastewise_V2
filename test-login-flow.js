const http = require('http');

const testLogin = async () => {
    console.log("🧪 Testing login flow...");
    
    const postData = JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
    });
    
    const options = {
        hostname: '172.28.31.179',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log('Response:', data);
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', (e) => {
            console.error(`Request error: ${e.message}`);
            reject(e);
        });
        
        req.write(postData);
        req.end();
    });
};

testLogin().then(result => {
    console.log("✅ Test completed");
    console.log("Result:", result);
}).catch(error => {
    console.error("❌ Test failed:", error);
});