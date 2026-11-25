import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(await readFile(path.join(here, '../registry-15.json'), 'utf8'));
const plan = JSON.parse(await readFile(path.join(here, 'migration-manifest.json'), 'utf8'));

const official = registry.members.filter((member) => member.group === 'official_13');
const baby = registry.members.filter((member) => member.id === 'baby');
const lucy = registry.members.filter((member) => member.id === 'lucy');
const officialIds = official.map((member) => member.id);

assert.equal(registry.declaredRoster.officialMembers, 13);
assert.equal(registry.declaredRoster.separateCore, 1);
assert.equal(registry.declaredRoster.separateDefense, 1);
assert.equal(registry.declaredRoster.totalParticipants, 15);
assert.equal(official.length, 13);
assert.equal(new Set(officialIds).size, 13);
assert.equal(baby.length, 1);
assert.equal(lucy.length, 1);
assert.equal(baby[0].group, 'separate_core');
assert.equal(lucy[0].group, 'separate_defense');
assert.equal(lucy[0].independent, true);
assert.equal(officialIds.includes('baby'), false);
assert.equal(officialIds.includes('lucy'), false);

assert.equal(plan.status, 'planning_only_no_runtime_changes');
assert.equal(plan.legacyRoster.declaredCount, 13);
assert.equal(plan.legacyRoster.ids.length, 13);
assert.equal(new Set(plan.legacyRoster.ids).size, 13);
assert.equal(plan.migration.separateOperatingCore.id, 'baby');
assert.equal(plan.migration.independentDefense.id, 'lucy');
assert.equal(plan.migration.independentDefense.includeInBabyAgentsConfig, false);
assert.equal(plan.migration.independentDefense.runtimeIndependent, true);
assert.deepEqual(
  [...plan.migration.createProfiles].sort(),
  ['cosmos', 'hera', 'svt', 'union']
);
assert.equal(plan.invariants.hdMatriz, 'read_only_no_writes');
assert.equal(plan.invariants.deployment, 'prohibited_in_this_phase');
assert.equal(plan.invariants.merge, 'prohibited_in_this_phase');
assert.equal(plan.invariants.secretsInRepository, false);

console.log(JSON.stringify({
  ok: true,
  status: 'contract_static_checks_passed',
  officialAgents: official.length,
  separateCore: baby[0].id,
  independentDefense: lucy[0].id,
  legacyProfilesToPreserve: plan.migration.preserveLegacyNonCouncil.map((item) => item.id),
  newProfilesRequired: plan.migration.createProfiles,
  limitations: 'No backend runtime, provider, HD-MATRIZ or LUCY service was executed or modified.'
}, null, 2));
