package com.lorepo.icplayer.client.module;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import com.google.gwt.xml.client.Document;
import com.google.gwt.xml.client.Element;
import com.google.gwt.xml.client.Node;
import com.google.gwt.xml.client.XMLParser;
import com.lorepo.icplayer.client.dimensions.ModuleDimensions;
import com.lorepo.icplayer.client.model.layout.PageLayout;

public class SemiResponsivePositions {
	private HashMap<String, ModuleDimensions> positions = new HashMap<String, ModuleDimensions>();
	private HashMap<String, LayoutDefinition> layoutsDefinitions = new HashMap<String, LayoutDefinition>();
	private HashMap<String, Boolean> isVisible = new HashMap<String, Boolean>();
	private HashMap<String, Boolean> isLocked = new HashMap<String, Boolean>();
	private HashMap<String, Boolean> isModuleVisibleInEditor = new HashMap<String, Boolean>();
	
	
	private String defaultLayoutID = "default";
	private String semiResponsiveID = "default";
	
	public SemiResponsivePositions () {
		this.positions.put(this.defaultLayoutID, new ModuleDimensions());
		this.layoutsDefinitions.put(this.defaultLayoutID, new LayoutDefinition());
		this.isVisible.put(this.semiResponsiveID, true);
		this.isLocked.put(this.semiResponsiveID, false);
		this.isModuleVisibleInEditor.put(this.semiResponsiveID, true);
	}
	
	public void addSemiResponsiveDimensions(String name, ModuleDimensions dimensions) {
		this.positions.put(name,  dimensions);
	}
	
	public int getPositionValue(String attribute) {
		ModuleDimensions dimensions = this.positions.get(this.semiResponsiveID);
		return dimensions.getValueByAttributeName(attribute);
	}
	
	public void setPositionValue(String attribute, int value) {
		ModuleDimensions dimensions = this.positions.get(this.semiResponsiveID);
		dimensions.setValueByAttributeName(attribute, value);
		this.positions.put(this.semiResponsiveID, dimensions);
	}
	
	public void setSemiResponsiveLayoutID (String semiResponsiveLayoutID) {
		this.semiResponsiveID = semiResponsiveLayoutID;
		this.ensureLayoutExistsOrFallbackToDefault(semiResponsiveLayoutID);
	}
	
	public void setLayoutDefinition(String layoutSemiResponsiveID, LayoutDefinition layout) {
		this.layoutsDefinitions.put(layoutSemiResponsiveID, layout);
	}
	
	public LayoutDefinition getCurrentLayoutDefinition() {
		return this.layoutsDefinitions.get(this.semiResponsiveID);
	}
	

	public HashMap<String, ModuleDimensions> getAllLayoutsDefinitions() {
		return this.positions;
	}

	public void syncSemiResponsiveLayouts(Set<PageLayout> actualSemiResponsiveLayouts) {
		this.syncDefaultLayoutID(actualSemiResponsiveLayouts);
		this.deleteOldLayouts(actualSemiResponsiveLayouts);
		this.addMissingLayouts(actualSemiResponsiveLayouts);
		this.syncCurrentLayoudID();
	}

	private void syncDefaultLayoutID(Set<PageLayout> actualSemiResponsiveLayouts) {
		for(PageLayout pl : actualSemiResponsiveLayouts) {
			if (pl.isDefault()) {
				String actualDefaultID = pl.getID();
				if (this.defaultLayoutID.compareTo(actualDefaultID) != 0) {
					this.ensureLayoutExistsOrFallbackToDefault(actualDefaultID);
					this.defaultLayoutID = actualDefaultID;
				}
				break;
			}
		}
	}

	private void deleteOldLayouts(Set<PageLayout> actualSemiResponsiveLayouts) {
		Set<String> actualIDs = this.convertToActualLayoutsIDs(actualSemiResponsiveLayouts);
		
		this.removeOldKeysFromHashMap(actualIDs, this.positions);
		this.removeOldKeysFromHashMap(actualIDs, this.layoutsDefinitions);
		this.removeOldKeysFromHashMap(actualIDs, this.isVisible);
		this.removeOldKeysFromHashMap(actualIDs, this.isLocked);
		this.removeOldKeysFromHashMap(actualIDs, this.isModuleVisibleInEditor);
	}

	private void removeOldKeysFromHashMap(Set<String> actualIDs, HashMap<String, ?> hashmap) {
		for (String key : hashmap.keySet()) {
			if(!actualIDs.contains(key)) {
				hashmap.remove(key);
			}
		}
	}
	
	private void addMissingLayouts(Set<PageLayout> actualSemiResponsiveLayouts) {
		for(PageLayout pl : actualSemiResponsiveLayouts) {
			this.ensureLayoutExistsOrFallbackToDefault(pl.getID());
		}
	}
	

	private void syncCurrentLayoudID() {
		if (!this.positions.containsKey(this.semiResponsiveID)) {
			this.semiResponsiveID = this.defaultLayoutID;
		}
	}

	private Set<String> convertToActualLayoutsIDs(
			Set<PageLayout> actualSemiResponsiveLayouts) {
		Set<String> actualIDs = new HashSet<String>();
		for (PageLayout pl : actualSemiResponsiveLayouts) {
			actualIDs.add(pl.getID());
		}
		return actualIDs;
	}

	private void ensureLayoutExistsOrFallbackToDefault(String semiResponsiveLayoutID) {
		if (!this.positions.containsKey(semiResponsiveLayoutID)) {
			ModuleDimensions copyOfDefaultDimensions = this.getDefaultDimensionsCopy();
			this.positions.put(semiResponsiveLayoutID, copyOfDefaultDimensions);
		}
		
		if (!this.layoutsDefinitions.containsKey(semiResponsiveLayoutID)) {
			LayoutDefinition copyOfDefaultLayoutDefinition = this.getDefaultLayoutDefinitionCopy();
			this.layoutsDefinitions.put(semiResponsiveLayoutID, copyOfDefaultLayoutDefinition);
		}
		
		this.ensureDefaultValueInBooleanHashMap(semiResponsiveLayoutID, this.isLocked);
		this.ensureDefaultValueInBooleanHashMap(semiResponsiveLayoutID, this.isModuleVisibleInEditor);
		this.ensureDefaultValueInBooleanHashMap(semiResponsiveLayoutID, this.isVisible);
	}

	private void ensureDefaultValueInBooleanHashMap(String semiResponsiveLayoutID, HashMap<String, Boolean> hashmap) {
		if (!hashmap.containsKey(semiResponsiveLayoutID)) {
			hashmap.put(semiResponsiveLayoutID, hashmap.get(this.defaultLayoutID));
		}
	}

	private LayoutDefinition getDefaultLayoutDefinitionCopy() {
		LayoutDefinition layoutDefinition = this.layoutsDefinitions.get(this.defaultLayoutID);
		LayoutDefinition copyOfDefaultLayout = LayoutDefinition.copy(layoutDefinition);
		return copyOfDefaultLayout;
	}

	private ModuleDimensions getDefaultDimensionsCopy() {
		ModuleDimensions defaultDimensions = this.positions.get(this.defaultLayoutID);
		ModuleDimensions copyOfDefaultDimensions = ModuleDimensions.copy(defaultDimensions);
		return copyOfDefaultDimensions;
	}

	public boolean isModuleInEditorVisible() {
		return this.isModuleVisibleInEditor.get(this.semiResponsiveID);
	}

	public boolean isVisible() {
		return this.isVisible.get(this.semiResponsiveID);
	}

	public boolean isLocked() {
		return this.isLocked.get(this.semiResponsiveID);
	}

	public void setIsVisible(Boolean isVisible) {
		this.isVisible.put(this.semiResponsiveID, isVisible);
	}

	public void setIsLocked(Boolean isLocked) {
		this.isLocked.put(semiResponsiveID, isLocked);
	}

	public void setIsVisibleInEditor(Boolean isVisibleInEditor) {
		this.isModuleVisibleInEditor.put(this.semiResponsiveID, isVisibleInEditor);
	}

	public void setIsVisible(String layoutID, boolean isVisible) {
		this.isVisible.put(layoutID, isVisible);
	}

	public void setIsLocked(String layoutID, boolean isLocked) {
		this.isLocked.put(layoutID, isLocked);
	}

	public void setIsVisibleInEditor(String layoutID, boolean isVisibleInEditor) {
		this.isModuleVisibleInEditor.put(layoutID, isVisibleInEditor);
	}

	public void lock(boolean state) {
		this.isLocked.put(this.semiResponsiveID, state);
	}

	public Element toXML() {
		Document doc = XMLParser.createDocument();
		Element layouts = doc.createElement("layouts");
		
		for(String layoutID : this.positions.keySet()) {
			Element layout = doc.createElement("layout");
			layout.setAttribute("isLocked", this.isLocked.get(layoutID).toString());
			layout.setAttribute("isModuleVisibleInEditor", this.isModuleVisibleInEditor.get(layoutID).toString());
			layout.setAttribute("id", layoutID);
			layout.setAttribute("isVisible", this.isVisible.get(layoutID).toString());
			layout.appendChild(this.layoutsDefinitions.get(layoutID).toXML());
			layout.appendChild(this.getAbsolutePositionsXML(layoutID, doc));
			
			layouts.appendChild(layout);
		}
		
		return layouts;
	}

	private Node getAbsolutePositionsXML(String layoutID, Document doc) {
		Element absolute = doc.createElement("absolute");
		ModuleDimensions moduleDimensions = this.positions.get(layoutID);
		
		absolute.setAttribute("left", Integer.toString(moduleDimensions.left));
		absolute.setAttribute("right", Integer.toString(moduleDimensions.right));
		absolute.setAttribute("top", Integer.toString(moduleDimensions.top));
		absolute.setAttribute("bottom", Integer.toString(moduleDimensions.bottom));
		absolute.setAttribute("width", Integer.toString(moduleDimensions.width));
		absolute.setAttribute("height", Integer.toString(moduleDimensions.height));
		
		return absolute;
	}

	public void addRelativeLayout(String id, LayoutDefinition relativeLayout) {
		this.layoutsDefinitions.put(id, relativeLayout);
	}
}