const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const ErrorQuery = require('./src/models/ErrorQuery');
const Subscription = require('./src/models/Subscription');
const Team = require('./src/models/Team');
const TeamMember = require('./src/models/TeamMember');
const SharedError = require('./src/models/SharedError');

// Import associations
require('./src/models/associations');

async function createTeamTables() {
  try {
    console.log('Creating team-related tables...');

    // Create tables in order (respecting foreign key dependencies)
    await Team.sync({ alter: true });
    console.log('✓ Teams table created/updated');

    await TeamMember.sync({ alter: true });
    console.log('✓ Team members table created/updated');

    await SharedError.sync({ alter: true });
    console.log('✓ Shared errors table created/updated');

    console.log('✅ All team tables created successfully!');
    
    // Test the associations
    const teamCount = await Team.count();
    const memberCount = await TeamMember.count();
    const sharedErrorCount = await SharedError.count();
    
    console.log(`Current counts:
    - Teams: ${teamCount}
    - Team Members: ${memberCount}
    - Shared Errors: ${sharedErrorCount}
    `);

    console.log('🎉 Team feature database setup complete!');

  } catch (error) {
    console.error('Error creating team tables:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTeamTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createTeamTables };