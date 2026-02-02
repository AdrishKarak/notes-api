// Test script for Notes API
// Run this after starting the server with: node test.js

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Notes API\n');
  console.log('=' .repeat(60));

  // Test 1: Create a valid note
  console.log('\n📝 Test 1: Create a valid note');
  try {
    const response = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '  Meeting Notes  ',
        content: '  Discussed hiring plan and deadlines  '
      })
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Create note with empty title (should fail)
  console.log('\n📝 Test 2: Create note with empty title (validation test)');
  try {
    const response = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '   ',
        content: 'Some content'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 3: Create note with empty content (should fail)
  console.log('\n📝 Test 3: Create note with empty content (validation test)');
  try {
    const response = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        content: '   '
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 4: Create a few more notes
  console.log('\n📝 Test 4: Create additional notes');
  const notesToCreate = [
    { title: 'Project Ideas', content: 'Build a task manager app' },
    { title: 'Shopping List', content: 'Buy groceries and cleaning supplies' },
    { title: 'Meeting agenda', content: 'Discuss Q1 goals and team structure' }
  ];

  for (const note of notesToCreate) {
    try {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      const data = await response.json();
      console.log(`✅ Created: ${note.title}`);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    // Small delay to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test 5: Get all notes
  console.log('\n📋 Test 5: Get all notes (sorted by most recently updated)');
  try {
    const response = await fetch(`${BASE_URL}/notes`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 6: Update a note
  console.log('\n✏️  Test 6: Update note with id 1');
  try {
    const response = await fetch(`${BASE_URL}/notes/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Meeting Notes',
        content: 'Discussed hiring plan, deadlines, and budget allocation'
      })
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 7: Partial update (only content)
  console.log('\n✏️  Test 7: Partial update (only content) for note 2');
  try {
    const response = await fetch(`${BASE_URL}/notes/2`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Build a task manager app with React and Node.js'
      })
    });
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 8: Update with no changes
  console.log('\n✏️  Test 8: Update with no actual changes');
  try {
    const response = await fetch(`${BASE_URL}/notes/2`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Build a task manager app with React and Node.js'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 9: Search notes
  console.log('\n🔍 Test 9: Search for "meeting"');
  try {
    const response = await fetch(`${BASE_URL}/notes/search?q=meeting`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 10: Search with case insensitivity
  console.log('\n🔍 Test 10: Search for "MEETING" (case-insensitive)');
  try {
    const response = await fetch(`${BASE_URL}/notes/search?q=MEETING`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 11: Search with extra spaces
  console.log('\n🔍 Test 11: Search with extra spaces "  meet  "');
  try {
    const response = await fetch(`${BASE_URL}/notes/search?q=${encodeURIComponent('  meet  ')}`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 12: Search with empty query
  console.log('\n🔍 Test 12: Search with empty query (should fail)');
  try {
    const response = await fetch(`${BASE_URL}/notes/search?q=`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 13: Rate limiting
  console.log('\n⏱️  Test 13: Rate limiting (creating 6 notes quickly)');
  console.log('Creating notes rapidly to test rate limit...');
  for (let i = 1; i <= 6; i++) {
    try {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Rate limit test ${i}`,
          content: `Testing rate limiting with note ${i}`
        })
      });
      const data = await response.json();
      if (response.status === 429) {
        console.log(`❌ Note ${i}: Rate limited!`, data.message);
      } else {
        console.log(`✅ Note ${i}: Created successfully`);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
}

// Run tests
testAPI().catch(console.error);