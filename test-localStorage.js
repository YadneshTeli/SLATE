// Simple test to verify localStorage functionality
console.log('Testing localStorage functionality...');

// Test setting and getting values
localStorage.setItem('slate-last-project-id', 'demo-project-sunburn');
localStorage.setItem('slate-last-project-user', 'vittal');

console.log('Set values:');
console.log('Project ID:', localStorage.getItem('slate-last-project-id'));
console.log('User ID:', localStorage.getItem('slate-last-project-user'));

// Simulate clearing
localStorage.removeItem('slate-last-project-id');
localStorage.removeItem('slate-last-project-user');

console.log('After clearing:');
console.log('Project ID:', localStorage.getItem('slate-last-project-id'));
console.log('User ID:', localStorage.getItem('slate-last-project-user'));

console.log('localStorage test completed successfully!');
