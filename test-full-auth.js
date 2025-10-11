const http = require('http');

const testSignup = async () => {
    console.log("🧪 Testing signup flow...");
    
    const postData = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    });
    
    const options = {
        hostname: '172.28.31.179',
        port: 5001,
        path: '/api/auth/signup',
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

const testLogin = async () => {
    console.log("🧪 Testing login with new user...");
    
    const postData = JSON.stringify({
        email: 'test@example.com',
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

async function runTests() {
    try {
        console.log("1️⃣ Creating test user...");
        const signupResult = await testSignup();
        console.log("Signup result:", signupResult);
        
        console.log("\n2️⃣ Testing login with test user...");
        const loginResult = await testLogin();
        console.log("Login result:", loginResult);
        
        if (loginResult.data && loginResult.data.token) {
            console.log("✅ Login successful! Token received:", loginResult.data.token.substring(0, 20) + "...");
        } else {
            console.log("❌ Login failed - no token received");
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

runTests();