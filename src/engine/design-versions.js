export function createDesignVersion(project, workflow, label = '') {
  if (!workflow?.results) throw new Error('A ready workflow result is required');
  const preferred = workflow.results.budgets.find((item) => item.key === workflow.results.preferredScenario) ?? workflow.results.budgets[1];
  return {
    id: crypto.randomUUID(),
    label: label.trim() || `Phương án ${(project.designVersions?.length ?? 0) + 1}`,
    createdAt: new Date().toISOString(),
    inputs: {
      storeys: project.design.storeys.value,
      footprintRatio: project.design.footprintRatio.value,
      finishLevel: project.design.finishLevel.value,
      bedrooms: project.household.bedrooms.value,
      people: project.household.people.value,
    },
    summary: {
      floorAreaM2: workflow.results.areas.floorArea.value,
      estimatedBudgetVnd: workflow.results.primaryBudget?.centerVnd ?? preferred.total,
      preferredScenario: workflow.results.preferredScenario,
    },
  };
}

export function addDesignVersion(project, version) {
  return {
    ...project,
    designVersions: [...(project.designVersions ?? []), version],
    updatedAt: new Date().toISOString(),
  };
}

export function removeDesignVersion(project, versionId) {
  return {
    ...project,
    designVersions: (project.designVersions ?? []).filter((item) => item.id !== versionId),
    updatedAt: new Date().toISOString(),
  };
}
