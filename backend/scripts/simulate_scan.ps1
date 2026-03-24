$loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body '{"email":"s1@gmail.com","password":"password"}' -ContentType "application/json"
$token = $loginRes.token
echo "Student Token: $token"

$scanRes = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/mark" -Method Post -Headers @{Authorization="Bearer $token"} -Body '{"qrToken":"9f3aa4d5-ad7e-4e22-b93e-e73379c09818","subjectId":"ea47aa78-fe91-4a2d-b4bc-cf4218c06cbb"}' -ContentType "application/json"
echo $scanRes
