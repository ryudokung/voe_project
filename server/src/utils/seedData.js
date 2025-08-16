const { 
  sequelize,
  User,
  Department,
  IdeaCategory,
  Idea,
  IdeaVote,
  IdeaComment,
  IdeaStatusHistory 
} = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (in development mode)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true });
      console.log('✅ Database synchronized');
    }

    // Create departments
    const departments = await Department.bulkCreate([
      {
        name: 'Information Technology',
        description: 'Technology and system development'
      },
      {
        name: 'Human Resources',
        description: 'Employee management and development'
      },
      {
        name: 'Finance',
        description: 'Financial planning and accounting'
      },
      {
        name: 'Marketing',
        description: 'Marketing and customer relations'
      },
      {
        name: 'Operations',
        description: 'Daily operations and logistics'
      },
      {
        name: 'Research & Development',
        description: 'Innovation and product development'
      }
    ]);
    console.log('✅ Created departments');

    // Create idea categories
    const categories = await IdeaCategory.bulkCreate([
      {
        name: 'Process Improvement',
        color: '#007bff',
        icon: 'cog',
        description: 'Ideas to improve existing processes and workflows'
      },
      {
        name: 'Cost Reduction',
        color: '#28a745',
        icon: 'dollar-sign',
        description: 'Ideas to reduce costs and increase efficiency'
      },
      {
        name: 'Employee Wellbeing',
        color: '#17a2b8',
        icon: 'heart',
        description: 'Ideas to improve employee satisfaction and wellbeing'
      },
      {
        name: 'Technology Innovation',
        color: '#6f42c1',
        icon: 'lightbulb',
        description: 'Technology-related improvements and innovations'
      },
      {
        name: 'Customer Experience',
        color: '#fd7e14',
        icon: 'users',
        description: 'Ideas to enhance customer satisfaction and experience'
      },
      {
        name: 'Sustainability',
        color: '#20c997',
        icon: 'leaf',
        description: 'Environmental and sustainability initiatives'
      },
      {
        name: 'Safety & Security',
        color: '#dc3545',
        icon: 'shield-alt',
        description: 'Workplace safety and security improvements'
      },
      {
        name: 'Other',
        color: '#6c757d',
        icon: 'question',
        description: 'Other ideas that don\'t fit in specific categories'
      }
    ]);
    console.log('✅ Created idea categories');

    // Create sample users
    const users = await User.bulkCreate([
      {
        employee_no: 'EMP001',
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'Admin123!',
        department_id: departments[0].id, // IT
        role: 'admin'
      },
      {
        employee_no: 'EMP002',
        name: 'John Smith',
        email: 'john.smith@company.com',
        password: 'User123!',
        department_id: departments[0].id, // IT
        role: 'moderator'
      },
      {
        employee_no: 'EMP003',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        password: 'User123!',
        department_id: departments[1].id, // HR
        role: 'executive'
      },
      {
        employee_no: 'EMP004',
        name: 'Mike Davis',
        email: 'mike.davis@company.com',
        password: 'User123!',
        department_id: departments[2].id, // Finance
        role: 'employee'
      },
      {
        employee_no: 'EMP005',
        name: 'Lisa Chen',
        email: 'lisa.chen@company.com',
        password: 'User123!',
        department_id: departments[3].id, // Marketing
        role: 'employee'
      },
      {
        employee_no: 'EMP006',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        password: 'User123!',
        department_id: departments[4].id, // Operations
        role: 'employee'
      },
      {
        employee_no: 'EMP007',
        name: 'Emily Brown',
        email: 'emily.brown@company.com',
        password: 'User123!',
        department_id: departments[5].id, // R&D
        role: 'employee'
      },
      {
        employee_no: 'EMP008',
        name: 'Robert Taylor',
        email: 'robert.taylor@company.com',
        password: 'User123!',
        department_id: departments[0].id, // IT
        role: 'employee'
      }
    ]);
    console.log('✅ Created sample users');

    // Create sample ideas
    const ideas = await Idea.bulkCreate([
      {
        title: 'Implement Remote Work Policy',
        description: 'Create a comprehensive remote work policy that allows employees to work from home 2-3 days per week. This would improve work-life balance and reduce office overhead costs while maintaining productivity.',
        category_id: categories.find(c => c.name === 'Employee Wellbeing').id,
        creator_id: users[4].id, // Lisa Chen
        status: 'under_review',
        visibility: 'public',
        expected_benefit: 'Improved employee satisfaction, reduced office costs, increased productivity'
      },
      {
        title: 'Automate Invoice Processing',
        description: 'Implement an automated invoice processing system using OCR and machine learning to reduce manual data entry and processing time. This would speed up payments and reduce errors.',
        category_id: categories.find(c => c.name === 'Process Improvement').id,
        creator_id: users[3].id, // Mike Davis
        status: 'shortlisted',
        visibility: 'public',
        expected_benefit: 'Reduced processing time by 80%, fewer errors, cost savings on manual labor'
      },
      {
        title: 'Green Energy Initiative',
        description: 'Install solar panels on office rooftops and switch to renewable energy sources. This would reduce our carbon footprint and long-term energy costs.',
        category_id: categories.find(c => c.name === 'Sustainability').id,
        creator_id: users[6].id, // Emily Brown
        status: 'in_pilot',
        visibility: 'public',
        expected_benefit: '30% reduction in energy costs, improved corporate image, environmental impact'
      },
      {
        title: 'Employee Mobile App',
        description: 'Develop a mobile app for employees to access company information, submit requests, and communicate with colleagues. Include features like leave requests, expense reporting, and internal directory.',
        category_id: categories.find(c => c.name === 'Technology Innovation').id,
        creator_id: users[7].id, // Robert Taylor
        status: 'submitted',
        visibility: 'public',
        expected_benefit: 'Improved employee experience, faster request processing, better communication'
      },
      {
        title: 'Customer Feedback Dashboard',
        description: 'Create a real-time dashboard showing customer feedback from all channels (email, social media, surveys, support tickets). This would help us respond faster to customer concerns.',
        category_id: categories.find(c => c.name === 'Customer Experience').id,
        creator_id: users[4].id, // Lisa Chen
        status: 'implemented',
        visibility: 'public',
        expected_benefit: 'Faster response to customer issues, improved satisfaction scores, better insights'
      },
      {
        title: 'Paperless Office Initiative',
        description: 'Transition to a completely paperless office by digitizing all documents and processes. Implement digital signatures and electronic filing systems.',
        category_id: categories.find(c => c.name === 'Cost Reduction').id,
        creator_id: users[5].id, // David Wilson
        status: 'under_review',
        visibility: 'public',
        expected_benefit: 'Reduced paper costs, improved efficiency, better document security'
      },
      {
        title: 'Wellness Program Enhancement',
        description: 'Expand our employee wellness program to include mental health support, fitness subsidies, and flexible working hours during school holidays.',
        category_id: categories.find(c => c.name === 'Employee Wellbeing').id,
        creator_id: users[2].id, // Sarah Johnson
        status: 'shortlisted',
        visibility: 'department',
        expected_benefit: 'Improved employee health, reduced sick days, higher retention rates'
      },
      {
        title: 'Security Access Card Integration',
        description: 'Integrate access cards with the IT system to automatically log working hours and provide secure access to different areas based on employee roles.',
        category_id: categories.find(c => c.name === 'Safety & Security').id,
        creator_id: users[7].id, // Robert Taylor
        status: 'submitted',
        visibility: 'public',
        expected_benefit: 'Improved security, automated time tracking, better compliance'
      }
    ]);
    console.log('✅ Created sample ideas');

    // Create votes for ideas
    const votes = [];
    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i];
      // Each idea gets random votes from different users
      const numVotes = Math.floor(Math.random() * 6) + 2; // 2-7 votes per idea
      const voterIds = [];
      
      while (voterIds.length < numVotes) {
        const randomUserId = users[Math.floor(Math.random() * users.length)].id;
        if (randomUserId !== idea.creator_id && !voterIds.includes(randomUserId)) {
          voterIds.push(randomUserId);
        }
      }

      for (const userId of voterIds) {
        votes.push({
          idea_id: idea.id,
          user_id: userId,
          vote_type: Math.random() > 0.2 ? 1 : -1 // 80% upvotes, 20% downvotes
        });
      }
    }

    await IdeaVote.bulkCreate(votes);
    console.log('✅ Created sample votes');

    // Update vote counts on ideas
    for (const idea of ideas) {
      const voteSum = await IdeaVote.sum('vote_type', {
        where: { idea_id: idea.id }
      });
      await idea.update({ vote_count: voteSum || 0 });
    }
    console.log('✅ Updated vote counts');

    // Create sample comments
    const comments = await IdeaComment.bulkCreate([
      {
        idea_id: ideas[0].id, // Remote Work Policy
        user_id: users[1].id, // John Smith (moderator)
        body: 'This is an excellent idea! We should definitely explore this further. Have you considered how we would handle security and collaboration challenges?',
        is_moderator_note: true
      },
      {
        idea_id: ideas[0].id,
        user_id: users[3].id, // Mike Davis
        body: 'I support this idea. Remote work has been proven to increase productivity in many companies. We could start with a pilot program.',
        is_moderator_note: false
      },
      {
        idea_id: ideas[1].id, // Automate Invoice Processing
        user_id: users[2].id, // Sarah Johnson (executive)
        body: 'The potential ROI on this looks very promising. Finance team should provide a detailed cost-benefit analysis.',
        is_moderator_note: false
      },
      {
        idea_id: ideas[2].id, // Green Energy Initiative
        user_id: users[5].id, // David Wilson
        body: 'Great initiative! This aligns perfectly with our sustainability goals. We should also consider energy-efficient lighting and equipment.',
        is_moderator_note: false
      },
      {
        idea_id: ideas[3].id, // Employee Mobile App
        user_id: users[1].id, // John Smith (moderator)
        body: 'IT department is currently evaluating this proposal. We need to assess the development costs and timeline.',
        is_moderator_note: true
      },
      {
        idea_id: ideas[4].id, // Customer Feedback Dashboard
        user_id: users[4].id, // Lisa Chen (creator responding)
        body: 'Thanks for the positive feedback! I\'ve already started gathering requirements from different departments.',
        is_moderator_note: false
      }
    ]);
    console.log('✅ Created sample comments');

    // Update comment counts on ideas
    for (const idea of ideas) {
      const commentCount = await IdeaComment.count({
        where: { idea_id: idea.id }
      });
      await idea.update({ comment_count: commentCount });
    }
    console.log('✅ Updated comment counts');

    // Create status history for ideas with status changes
    const statusHistories = [];
    
    for (const idea of ideas) {
      // Initial submission
      statusHistories.push({
        idea_id: idea.id,
        from_status: null,
        to_status: 'submitted',
        changed_by: idea.creator_id,
        note: 'Idea submitted'
      });

      // Add status changes based on current status
      if (idea.status !== 'submitted') {
        statusHistories.push({
          idea_id: idea.id,
          from_status: 'submitted',
          to_status: 'under_review',
          changed_by: users[1].id, // John Smith (moderator)
          note: 'Idea moved to review for evaluation'
        });

        if (['shortlisted', 'in_pilot', 'implemented'].includes(idea.status)) {
          statusHistories.push({
            idea_id: idea.id,
            from_status: 'under_review',
            to_status: 'shortlisted',
            changed_by: users[1].id, // John Smith (moderator)
            note: 'Idea approved for implementation planning'
          });
        }

        if (['in_pilot', 'implemented'].includes(idea.status)) {
          statusHistories.push({
            idea_id: idea.id,
            from_status: 'shortlisted',
            to_status: 'in_pilot',
            changed_by: users[1].id, // John Smith (moderator)
            note: 'Pilot implementation started'
          });
        }

        if (idea.status === 'implemented') {
          statusHistories.push({
            idea_id: idea.id,
            from_status: 'in_pilot',
            to_status: 'implemented',
            changed_by: users[1].id, // John Smith (moderator)
            note: 'Implementation completed successfully'
          });
        }
      }
    }

    await IdeaStatusHistory.bulkCreate(statusHistories);
    console.log('✅ Created status history records');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${departments.length} departments created`);
    console.log(`   • ${categories.length} idea categories created`);
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${ideas.length} ideas created`);
    console.log(`   • ${votes.length} votes created`);
    console.log(`   • ${comments.length} comments created`);
    console.log(`   • ${statusHistories.length} status history records created`);
    
    console.log('\n👥 Sample user accounts:');
    console.log('   • admin@company.com (Admin) - Password: Admin123!');
    console.log('   • john.smith@company.com (Moderator) - Password: User123!');
    console.log('   • sarah.johnson@company.com (Executive) - Password: User123!');
    console.log('   • mike.davis@company.com (Employee) - Password: User123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;
