// NOTE: Returns existing areas
// curl -u ":EJKRpszE1bOWFsbUHRtBno2AZuIto3vBr6PnZlJGlf2zeqpGIOEPJQQJ99BCACAAAAAAAAAAAAASAZDO1YFm" "https://dev.azure.com/aaronward/ContractClarity/_apis/wit/classificationnodes/areas?api-version=7.1"

// NOTE: Creates a new area
// curl -X POST -u ":EJKRpszE1bOWFsbUHRtBno2AZuIto3vBr6PnZlJGlf2zeqpGIOEPJQQJ99BCACAAAAAAAAAAAAASAZDO1YFm" \
//   -H "Content-Type: application/json" \
//   -d '{"name": "Analytics", "structureType": "area"}' \
//   https://dev.azure.com/aaronward/ConductivDemo/_apis/wit/classificationnodes/areas?api-version=7.1

// NOTE: Creates a sprint with start and end dates
// curl -X POST -u ":EJKRpszE1bOWFsbUHRtBno2AZuIto3vBr6PnZlJGlf2zeqpGIOEPJQQJ99BCACAAAAAAAAAAAAASAZDO1YFm" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "name": "Sprint 1",
//     "path": "\\Sprint 1",
//     "attributes": {
//       "startDate": "2025-04-01T00:00:00Z",
//       "finishDate": "2025-04-15T00:00:00Z"
//     }
//   }' \
//   "https://dev.azure.com/aaronward/ContractClarity/_apis/wit/classificationnodes/iterations?api-version=7.1"

// Script to upsert areas and sprints from JSON files into Azure DevOps
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Configuration
const organization = process.env.AZURE_DEVOPS_ORGANIZATION;
const project = process.env.AZURE_DEVOPS_PROJECT;
const apiVersion = process.env.AZURE_DEVOPS_API_VERSION;
const patToken = process.env.AZURE_DEVOPS_PAT_TOKEN;

if (!patToken) {
  console.error('Error: Azure DevOps PAT token not found in environment variables');
  process.exit(1);
}

// Base URLs for Azure DevOps API
const areasBaseUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes/areas`;
const iterationsBaseUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/classificationnodes/iterations`;
const teamsBaseUrl = `https://dev.azure.com/${organization}/_apis/projects/${project}/teams`;
const teamFieldValuesBaseUrl = `https://dev.azure.com/${organization}/${project}/_apis/work/teamsettings/teamfieldvalues`;

// Authentication headers
const authHeader = `Basic ${Buffer.from(`:${patToken}`).toString('base64')}`;
const headers = {
  'Authorization': authHeader,
  'Content-Type': 'application/json'
};

// Read JSON files
const areasFilePath = path.resolve(__dirname, '../data/areas.json');
const sprintsFilePath = path.resolve(__dirname, '../data/sprints.json');
const teamsFilePath = path.resolve(__dirname, '../data/teams.json');
const projectFilePath = path.resolve(__dirname, '../data/project.json');
const workItemsFilePath = path.resolve(__dirname, '../data/work_items.json');
const areasData = JSON.parse(fs.readFileSync(areasFilePath, 'utf8'));
const sprintsData = JSON.parse(fs.readFileSync(sprintsFilePath, 'utf8'));
const teamsData = JSON.parse(fs.readFileSync(teamsFilePath, 'utf8'));
const projectData = JSON.parse(fs.readFileSync(projectFilePath, 'utf8'));
const workItemsData = JSON.parse(fs.readFileSync(workItemsFilePath, 'utf8'));

// Work item type definitions
const WORK_ITEM_TYPES = {
  EPIC: 'Epic',
  FEATURE: 'Feature',
  USER_STORY: 'User Story',
  TASK: 'Task'
};

// Function to get existing areas
async function getExistingAreas() {
  try {
    const response = await axios.get(`${areasBaseUrl}?api-version=${apiVersion}&$depth=2`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching existing areas:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to get existing iterations
async function getExistingIterations() {
  try {
    const response = await axios.get(`${iterationsBaseUrl}?api-version=${apiVersion}&$depth=2`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching existing iterations:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to get existing teams
async function getExistingTeams() {
  try {
    const response = await axios.get(`${teamsBaseUrl}?api-version=${apiVersion}`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching existing teams:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to get existing work items by type
async function getExistingWorkItems(workItemType) {
  try {
    const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=${apiVersion}`;
    const requestBody = {
      query: `SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.WorkItemType] = '${workItemType}' AND [System.TeamProject] = '${project}'`
    };
    
    console.log(`Fetching existing ${workItemType} work items...`);
    
    const response = await axios.post(url, requestBody, { headers });
    return response.data;
  } catch (error) {
    console.error(`⚠️ Error fetching existing ${workItemType} work items:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return { workItems: [] };
  }
}

// Function to create a new area
async function createArea(name, parentPath = null) {
  try {
    const url = parentPath 
      ? `${areasBaseUrl}/${parentPath}?api-version=${apiVersion}` 
      : `${areasBaseUrl}?api-version=${apiVersion}`;
    
    const response = await axios.post(url, {
      name: name,
      structureType: 'area'
    }, { headers });
    
    console.log(`Created area: ${name}${parentPath ? ` under ${parentPath}` : ''}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error creating area '${name}':`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to create a new iteration (quarter or sprint)
async function createIteration(name, parentPath = null, startDate = null, endDate = null) {
  try {
    const url = parentPath 
      ? `${iterationsBaseUrl}/${parentPath}?api-version=${apiVersion}` 
      : `${iterationsBaseUrl}?api-version=${apiVersion}`;
    
    const payload = {
      name: name,
      structureType: 'iteration'
    };
    
    // Add dates if provided
    if (startDate && endDate) {
      payload.attributes = {
        startDate: `${startDate}T00:00:00Z`,
        finishDate: `${endDate}T23:59:59Z`
      };
    }
    
    const response = await axios.post(url, payload, { headers });
    
    console.log(`Created iteration: ${name}${parentPath ? ` under ${parentPath}` : ''}${startDate ? ` (${startDate} to ${endDate})` : ''}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error creating iteration '${name}':`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to create a new team
async function createTeam(name, description = '') {
  try {
    const response = await axios.post(`${teamsBaseUrl}?api-version=${apiVersion}`, {
      name: name,
      description: description
    }, { headers });
    
    console.log(`Created team: ${name}`);
    
    // Add a delay after team creation to allow Azure DevOps to fully provision the team
    console.log(`Waiting 3 seconds for team provisioning to complete...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error creating team '${name}':`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to set a team's default iteration path (backlog iteration)
async function setTeamDefaultIteration(teamName, iterationPath = '') {
  try {
    // If no iteration path is provided, use the root project
    const fullIterationPath = iterationPath ? `${project}\\${iterationPath}` : project;
    
    // Payload for setting the backlog iteration
    const payload = {
      defaultIteration: fullIterationPath,
      backlogIteration: fullIterationPath
    };
    
    // API endpoint for team's iteration settings
    const url = `https://dev.azure.com/${organization}/${project}/_apis/work/teamsettings/iterations?api-version=${apiVersion}&team=${encodeURIComponent(teamName)}`;
    
    console.log(`Setting default iteration for team '${teamName}' to '${fullIterationPath}'`);
    console.log(`Calling API: ${url}`);
    
    const response = await axios.patch(url, payload, { headers });
    console.log(`Set default iteration for team '${teamName}': ${fullIterationPath}`);
    return response.data;
  } catch (error) {
    console.error(`⚠️ Warning: Could not set default iteration for team '${teamName}':`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    // Don't throw the error, just log it and continue
    return null;
  }
}

// Function to set a team's default area path
async function setTeamAreaPath(teamId, teamName, areaPath = null, includeSubareas = true, retryCount = 0) {
  try {
    // If areaPath is null or undefined, use the project name as the default area path
    // This ensures teams always have an area path assigned
    const fullAreaPath = areaPath ? `${project}\\${areaPath}` : project;
    
    // Payload for setting the default area path
    const payload = {
      defaultValue: fullAreaPath,
      values: [
        {
          value: fullAreaPath,
          includeChildren: includeSubareas
        }
      ]
    };
    
    // API endpoint for team's area path settings - using team name as query parameter
    const url = `https://dev.azure.com/${organization}/${project}/_apis/work/teamsettings/teamfieldvalues?api-version=${apiVersion}&team=${encodeURIComponent(teamName)}`;
    
    console.log(`Setting area path for team '${teamName}' to '${fullAreaPath}'`);
    console.log(`Calling API: ${url}`);
    
    const response = await axios.patch(url, payload, { headers });
    console.log(`Set area path for team '${teamName}' to '${fullAreaPath}' (Include subareas: ${includeSubareas})`);
    return response.data;
  } catch (error) {
    // Check if this is the "team field not set" error
    const isTeamFieldNotSetError = 
      error.response && 
      (error.response.status === 400 || error.response.status === 401) && 
      error.response.data && 
      error.response.data.message && 
      (error.response.data.message.includes("You have not set your team field") || 
       error.response.data.message.includes("TF400499"));
    
    // If it's the team field not set error and we haven't retried too many times
    if (isTeamFieldNotSetError && retryCount < 5) {
      // Increase wait time with each retry
      const waitTime = 2000 + (retryCount * 1000);
      console.log(`Team '${teamName}' not fully provisioned yet. Waiting ${waitTime/1000} seconds before retry...`);
      // Wait for the calculated time
      await new Promise(resolve => setTimeout(resolve, waitTime));
      // Retry with incremented retry count
      console.log(`Retrying... (Attempt ${retryCount + 1} of 5)`);
      return setTeamAreaPath(teamId, teamName, areaPath, includeSubareas, retryCount + 1);
    }
    
    console.error(`❌ Error setting area path for team '${teamName}':`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    // Don't throw the error, just log it and continue
    return null;
  }
}

// Function to configure a team with iterations and area paths
async function configureTeam(teamId, teamName, focusArea = null) {
  try {
    // Step 1: Wait for team provisioning
    console.log(`Waiting 5 seconds for team '${teamName}' provisioning to complete...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: Set default iteration (backlog iteration)
    // Use Quarter 01 as the default iteration for all teams
    await setTeamDefaultIteration(teamName, 'Quarter 01');
    
    // Step 3: Set the team's default area path
    if (focusArea) {
      console.log(`Setting default area path for team '${teamName}' to '${focusArea}'`);
      await setTeamAreaPath(teamId, teamName, focusArea, true);
    } else {
      // For teams without focus areas, set the project root as the default area
      console.log(`Setting default area path for team '${teamName}' to project root`);
      await setTeamAreaPath(teamId, teamName, null, false);
    }
    
    return true;
  } catch (error) {
    console.error(`⚠️ Warning: Could not fully configure team '${teamName}':`, error.message);
    return false;
  }
}

// Function to check if an area exists
function areaExists(existingAreas, areaName, parentPath = null) {
  if (!existingAreas || !existingAreas.children) {
    return false;
  }
  
  if (!parentPath) {
    // Check top-level areas
    return existingAreas.children.some(area => area.name === areaName);
  } else {
    // Find parent area
    const parentPathParts = parentPath.split('/');
    const parentName = parentPathParts[parentPathParts.length - 1];
    
    const parentArea = existingAreas.children.find(area => area.name === parentName);
    if (!parentArea || !parentArea.children) {
      return false;
    }
    
    // Check if subarea exists under parent
    return parentArea.children.some(subarea => subarea.name === areaName);
  }
}

// Function to check if an iteration exists
function iterationExists(existingIterations, iterationName, parentPath = null) {
  if (!existingIterations || !existingIterations.children) {
    return false;
  }
  
  if (!parentPath) {
    // Check top-level iterations
    return existingIterations.children.some(iteration => iteration.name === iterationName);
  } else {
    // Find parent iteration
    const parentPathParts = parentPath.split('/');
    const parentName = parentPathParts[parentPathParts.length - 1];
    
    const parentIteration = existingIterations.children.find(iteration => iteration.name === parentName);
    if (!parentIteration || !parentIteration.children) {
      return false;
    }
    
    // Check if sub-iteration exists under parent
    return parentIteration.children.some(subiteration => subiteration.name === iterationName);
  }
}

// Function to check if a team exists
function teamExists(existingTeams, teamName) {
  if (!existingTeams || !existingTeams.value) {
    return false;
  }
  
  return existingTeams.value.some(team => team.name.toLowerCase() === teamName.toLowerCase());
}

// Function to create a work item
async function createWorkItem(workItemType, fields, retryCount = 0) {
  try {
    const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${workItemType}?api-version=${apiVersion}`;
    
    // Format the fields into the required patch document format
    // Remove System.AssignedTo field as it's causing issues
    const filteredFields = { ...fields };
    if (filteredFields['System.AssignedTo']) {
      delete filteredFields['System.AssignedTo'];
    }
    
    const patchDocument = Object.entries(filteredFields).map(([key, value]) => ({
      op: 'add',
      path: `/fields/${key}`,
      value
    }));
    
    console.log(`Creating ${workItemType}: ${fields['System.Title']}`);
    
    const patchHeaders = {
      ...headers,
      'Content-Type': 'application/json-patch+json'
    };
    
    const response = await axios.post(url, patchDocument, { headers: patchHeaders });
    console.log(`✅ Created ${workItemType}: ${fields['System.Title']} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    if (retryCount < 3) {
      console.log(`Retrying creation of ${workItemType} (Attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return createWorkItem(workItemType, fields, retryCount + 1);
    }
    
    console.error(`❌ Error creating ${workItemType}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Function to create a link between work items
async function createWorkItemLink(sourceId, targetId, linkType) {
  try {
    const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${sourceId}?api-version=${apiVersion}`;
    
    const patchDocument = [
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: linkType,
          url: `https://dev.azure.com/${organization}/${project}/_apis/wit/workItems/${targetId}`
        }
      }
    ];
    
    const patchHeaders = {
      ...headers,
      'Content-Type': 'application/json-patch+json'
    };
    
    console.log(`Creating link from work item ${sourceId} to ${targetId} (type: ${linkType})`);
    
    const response = await axios.patch(url, patchDocument, { headers: patchHeaders });
    console.log(`Created link from work item ${sourceId} to ${targetId}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating link between work items ${sourceId} and ${targetId}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Function to find work item ID by name
function findWorkItemIdByName(workItems, name) {
  const workItem = workItems.find(item => item.fields['System.Title'] === name);
  return workItem ? workItem.id : null;
}

// Function to find work item ID by short description
function findWorkItemIdByShortDesc(createdItems, shortDesc) {
  return createdItems[shortDesc] || null;
}

// Main function to upsert areas
async function upsertAreas() {
  try {
    console.log('Fetching existing areas from Azure DevOps...');
    const existingAreasData = await getExistingAreas();
    
    console.log('Processing areas from areas.json...');
    
    // Process each top-level area
    for (const [areaName, areaData] of Object.entries(areasData)) {
      // Check if top-level area exists
      if (!areaExists(existingAreasData, areaName)) {
        console.log(`🆕 Top-level area '${areaName}' does not exist. Creating...`);
        await createArea(areaName);
      } else {
        console.log(`✅ Top-level area '${areaName}' already exists.`);
      }
      
      // Process subareas if they exist
      if (areaData.subareas && Array.isArray(areaData.subareas)) {
        for (const subarea of areaData.subareas) {
          if (!areaExists(existingAreasData, subarea, areaName)) {
            console.log(`🆕 Subarea '${subarea}' under '${areaName}' does not exist. Creating...`);
            await createArea(subarea, areaName);
          } else {
            console.log(`✅ Subarea '${subarea}' under '${areaName}' already exists.`);
          }
        }
      }
    }
    
    console.log('Area upsert process completed successfully.');
  } catch (error) {
    console.error('❌ Error during area upsert process:', error.message);
    process.exit(1);
  }
}

// Main function to upsert sprints
async function upsertSprints() {
  try {
    console.log('Fetching existing iterations from Azure DevOps...');
    const existingIterationsData = await getExistingIterations();
    
    console.log('Processing sprints from sprints.json...');
    
    // Process each quarter
    for (const [quarterName, quarterData] of Object.entries(sprintsData)) {
      // Check if quarter exists
      if (!iterationExists(existingIterationsData, quarterName)) {
        console.log(`🆕 Quarter '${quarterName}' does not exist. Creating...`);
        // Extract quarter start and end dates if they exist
        const quarterStartDate = quarterData.start_date;
        const quarterEndDate = quarterData.end_date;
        
        await createIteration(quarterName, null, quarterStartDate, quarterEndDate);
      } else {
        console.log(`✅ Quarter '${quarterName}' already exists.`);
      }
      
      // Process sprints in this quarter
      for (const [sprintName, sprintData] of Object.entries(quarterData)) {
        // Skip the start_date and end_date properties of the quarter
        if (sprintName === 'start_date' || sprintName === 'end_date') {
          continue;
        }
        
        if (!iterationExists(existingIterationsData, sprintName, quarterName)) {
          console.log(`🆕 Sprint '${sprintName}' under '${quarterName}' does not exist. Creating...`);
          await createIteration(
            sprintName, 
            quarterName, 
            sprintData.start_date, 
            sprintData.end_date
          );
        } else {
          console.log(`✅ Sprint '${sprintName}' under '${quarterName}' already exists.`);
        }
      }
    }
    
    console.log('Sprint upsert process completed successfully.');
  } catch (error) {
    console.error('❌ Error during sprint upsert process:', error.message);
    process.exit(1);
  }
}

// Main function to upsert teams
async function upsertTeams() {
  try {
    console.log('Fetching existing teams from Azure DevOps...');
    const existingTeamsData = await getExistingTeams();
    
    console.log('Processing teams from teams.json...');
    
    // Process product teams
    if (teamsData.product_teams && Array.isArray(teamsData.product_teams)) {
      console.log('Processing product teams...');
      for (const team of teamsData.product_teams) {
        let teamId;
        let isNewTeam = false;
        
        // Check if team exists
        const existingTeam = existingTeamsData.value.find(t => 
          t.name.toLowerCase() === team.name.toLowerCase()
        );
        
        if (!existingTeam) {
          console.log(`🆕 Product team '${team.name}' does not exist. Creating...`);
          try {
            const newTeam = await createTeam(team.name, team.description);
            teamId = newTeam.id;
            isNewTeam = true;
          } catch (error) {
            console.error(`❌ Failed to create team '${team.name}':`, error.message);
            continue; // Skip to next team
          }
        } else {
          console.log(`✅ Product team '${team.name}' already exists.`);
          teamId = existingTeam.id;
        }
        
        // Configure the team with iterations and area paths if it's a new team
        if (isNewTeam) {
          const focusArea = team.focus_area && Array.isArray(team.focus_area) && team.focus_area.length > 0 
            ? team.focus_area[0] 
            : null;
          
          await configureTeam(teamId, team.name, focusArea);
        }
      }
    }
    
    // Process shared service teams
    if (teamsData.shared_service_teams && Array.isArray(teamsData.shared_service_teams)) {
      console.log('Processing shared service teams...');
      for (const team of teamsData.shared_service_teams) {
        let teamId;
        let isNewTeam = false;
        
        // Check if team exists
        const existingTeam = existingTeamsData.value.find(t => 
          t.name.toLowerCase() === team.name.toLowerCase()
        );
        
        if (!existingTeam) {
          console.log(`🆕 Shared service team '${team.name}' does not exist. Creating...`);
          try {
            const newTeam = await createTeam(team.name, team.description);
            teamId = newTeam.id;
            isNewTeam = true;
          } catch (error) {
            console.error(`❌ Failed to create team '${team.name}':`, error.message);
            continue; // Skip to next team
          }
        } else {
          console.log(`✅ Shared service team '${team.name}' already exists.`);
          teamId = existingTeam.id;
        }
        
        // Configure the team with iterations and area paths if it's a new team
        if (isNewTeam) {
          const focusArea = team.focus_area && Array.isArray(team.focus_area) && team.focus_area.length > 0 
            ? team.focus_area[0] 
            : null;
          
          await configureTeam(teamId, team.name, focusArea);
        }
      }
    }
    
    console.log('✅ Team upsert process completed successfully.');
  } catch (error) {
    console.error('Error during team upsert process:', error.message);
    process.exit(1);
  }
}

// Main function to upsert epics
async function upsertEpics() {
  try {
    console.log('Starting epic creation process...');
    
    // Get existing epics
    const existingEpicsData = await getExistingWorkItems(WORK_ITEM_TYPES.EPIC);
    const existingEpics = existingEpicsData.workItems || [];
    
    // Map to store created epics by short description
    const createdEpics = {};
    
    // Process epics
    if (workItemsData.epics && Array.isArray(workItemsData.epics)) {
      for (const epic of workItemsData.epics) {
        // Check if epic already exists
        const existingEpic = existingEpics.find(e => 
          e.fields && e.fields['System.Title'] === epic.name
        );
        
        if (existingEpic) {
          console.log(`✅ Epic '${epic.name}' already exists (ID: ${existingEpic.id}).`);
          createdEpics[epic.short_desc] = existingEpic.id;
          continue;
        }
        
        // Create the epic
        const fields = {
          'System.Title': epic.name,
          'System.Description': epic.description || '',
          'System.AreaPath': epic.area ? `${project}\\${epic.area}` : project
          // Removed System.AssignedTo field as it's causing issues
        };
        
        const newEpic = await createWorkItem(WORK_ITEM_TYPES.EPIC, fields);
        if (newEpic) {
          createdEpics[epic.short_desc] = newEpic.id;
        }
      }
    }
    
    console.log('✅ Epic creation process completed.');
    return createdEpics;
  } catch (error) {
    console.error('❌ Error during epic creation process:', error.message);
    return {};
  }
}

// Main function to upsert features
async function upsertFeatures(createdEpics) {
  try {
    console.log('Starting feature creation process...');
    
    // Get existing features
    const existingFeaturesData = await getExistingWorkItems(WORK_ITEM_TYPES.FEATURE);
    const existingFeatures = existingFeaturesData.workItems || [];
    
    // Map to store created features by short description
    const createdFeatures = {};
    
    // Process features
    if (workItemsData.features && Array.isArray(workItemsData.features)) {
      for (const feature of workItemsData.features) {
        // Check if feature already exists
        const existingFeature = existingFeatures.find(f => 
          f.fields && f.fields['System.Title'] === feature.name
        );
        
        if (existingFeature) {
          console.log(`✅ Feature '${feature.name}' already exists (ID: ${existingFeature.id}).`);
          createdFeatures[feature.short_desc] = existingFeature.id;
          continue;
        }
        
        // Create the feature
        const fields = {
          'System.Title': feature.name,
          'System.AreaPath': feature.area ? `${project}\\${feature.area}` : project
          // Removed System.AssignedTo field as it's causing issues
        };
        
        const newFeature = await createWorkItem(WORK_ITEM_TYPES.FEATURE, fields);
        if (newFeature) {
          createdFeatures[feature.short_desc] = newFeature.id;
          
          // Link feature to epic if epic exists
          const epicId = findWorkItemIdByShortDesc(createdEpics, feature.epic_short_desc);
          if (epicId) {
            await createWorkItemLink(newFeature.id, epicId, 'System.LinkTypes.Hierarchy-Reverse');
          }
        }
      }
    }
    
    console.log('✅ Feature creation process completed.');
    return createdFeatures;
  } catch (error) {
    console.error('❌ Error during feature creation process:', error.message);
    return {};
  }
}

// Main function to upsert user stories
async function upsertUserStories(createdFeatures) {
  try {
    console.log('Starting user story creation process...');
    
    // Get existing user stories
    const existingStoriesData = await getExistingWorkItems(WORK_ITEM_TYPES.USER_STORY);
    const existingStories = existingStoriesData.workItems || [];
    
    // Map to store created user stories by short description
    const createdStories = {};
    
    // Process user stories
    if (workItemsData.user_stories && Array.isArray(workItemsData.user_stories)) {
      for (const story of workItemsData.user_stories) {
        // Check if user story already exists
        const existingStory = existingStories.find(s => 
          s.fields && s.fields['System.Title'] === story.name
        );
        
        if (existingStory) {
          console.log(`✅ User Story '${story.name}' already exists (ID: ${existingStory.id}).`);
          createdStories[story.short_desc] = existingStory.id;
          continue;
        }
        
        // Create the user story
        const fields = {
          'System.Title': story.name,
          'System.Description': story.description || '',
          'System.AreaPath': story.area ? `${project}\\${story.area}` : project
        };
        
        const newStory = await createWorkItem(WORK_ITEM_TYPES.USER_STORY, fields);
        if (newStory) {
          createdStories[story.short_desc] = newStory.id;
          
          // Link user story to feature if feature exists
          const featureId = findWorkItemIdByShortDesc(createdFeatures, story.feature_short_desc);
          if (featureId) {
            await createWorkItemLink(newStory.id, featureId, 'System.LinkTypes.Hierarchy-Reverse');
          }
        }
      }
    }
    
    console.log('✅ User story creation process completed.');
    return createdStories;
  } catch (error) {
    console.error('❌ Error during user story creation process:', error.message);
    return {};
  }
}

// Main function to upsert tasks
async function upsertTasks(createdStories) {
  try {
    console.log('Starting task creation process...');
    
    // Get existing tasks
    const existingTasksData = await getExistingWorkItems(WORK_ITEM_TYPES.TASK);
    const existingTasks = existingTasksData.workItems || [];
    
    // Process tasks
    if (workItemsData.tasks && Array.isArray(workItemsData.tasks)) {
      for (const task of workItemsData.tasks) {
        // Check if task already exists
        const existingTask = existingTasks.find(t => 
          t.fields && t.fields['System.Title'] === task.name
        );
        
        if (existingTask) {
          console.log(`✅ Task '${task.name}' already exists (ID: ${existingTask.id}).`);
          continue;
        }
        
        // Create the task
        const fields = {
          'System.Title': task.name,
          'System.AreaPath': task.area ? `${project}\\${task.area}` : project
          // Removed System.AssignedTo field as it's causing issues
        };
        
        const newTask = await createWorkItem(WORK_ITEM_TYPES.TASK, fields);
        if (newTask) {
          // Link task to user story if user story exists
          const storyId = findWorkItemIdByShortDesc(createdStories, task.user_story_short_desc);
          if (storyId) {
            await createWorkItemLink(newTask.id, storyId, 'System.LinkTypes.Hierarchy-Reverse');
          }
        }
      }
    }
    
    console.log('✅ Task creation process completed.');
  } catch (error) {
    console.error('❌ Error during task creation process:', error.message);
  }
}

// Main function to upsert all work items
async function upsertWorkItems() {
  try {
    console.log('Starting work items upsert process...');
    
    // Create epics first
    const createdEpics = await upsertEpics();
    
    // Create features and link to epics
    const createdFeatures = await upsertFeatures(createdEpics);
    
    // Create user stories and link to features
    const createdStories = await upsertUserStories(createdFeatures);
    
    // Create tasks and link to user stories
    await upsertTasks(createdStories);
    
    console.log('✅ Work items upsert process completed successfully.');
  } catch (error) {
    console.error('❌ Error during work items upsert process:', error.message);
    process.exit(1);
  }
}

// Execute the upsert functions
async function main() {
  try {
    // Create areas first
    await upsertAreas();
    
    // Create iterations (quarters and sprints)
    await upsertSprints();
    
    // Create teams
    await upsertTeams();
    
    // Create work items
    await upsertWorkItems();
    
    console.log('All operations completed successfully.');
  } catch (error) {
    console.error('❌ An error occurred during execution:', error.message);
    process.exit(1);
  }
}

main();