package com.lorepo.icplayer.client.module.addon;

import java.util.ArrayList;
import java.util.List;

import com.google.gwt.xml.client.Element;
import com.google.gwt.xml.client.Node;
import com.google.gwt.xml.client.NodeList;
import com.lorepo.icf.utils.XMLUtils;
import com.lorepo.icplayer.client.module.BasicModuleModel;
import com.lorepo.icplayer.client.module.addon.param.AddonParamFactory;
import com.lorepo.icplayer.client.module.addon.param.IAddonParam;

public class AddonModel extends BasicModuleModel {

	private String addonId;
	private ArrayList<IAddonParam>	addonParams = new ArrayList<IAddonParam>();
	private String baseURL;
	
	
	public AddonModel() {
		super("Addon", "Addon");
	}

	
	@Override
	public String getModuleTypeName() {
		
		if(addonId == null){
			return super.getModuleTypeName();
		}
		
		return addonId;
	}
	
	@Override
	public String getModuleName() {
		return getModuleTypeName();
	}

	
	@Override
	public String getProviderName() {
		return getModuleTypeName();
	}	
	
	public void load(Element node, String baseUrl, String version) {
		super.load(node, baseUrl, version);
		
		parseNode(node);
	}
	
	@Override
	public void load(Element rootElement, String baseUrl) {

		super.load(rootElement, baseUrl);

		parseNode(rootElement);
	}


	private void parseNode(Element rootElement) {
		addonParams.clear();
		addonId = rootElement.getAttribute("addonId");
		loadProperties(rootElement);
	}

	
	private void loadProperties(Element rootElement) {
		
		AddonParamFactory paramFactory = new AddonParamFactory();
		NodeList propertiesNodes = rootElement.getElementsByTagName("properties");

		if(propertiesNodes.getLength() > 0){
			
			NodeList optionNodes = propertiesNodes.item(0).getChildNodes();
			for(int i = 0; i < optionNodes.getLength(); i++){
	
				Node node = optionNodes.item(i);
				if(node instanceof Element && node.getNodeName().compareTo("property") == 0){
					Element element = (Element)node;
					String type = XMLUtils.getAttributeAsString(element, "type");
					IAddonParam addonParam = paramFactory.createAddonParam(this, type);
					
					addonParam.load(element, baseURL);
					addAddonParam(addonParam);
				}
			}
		}
	}


	@Override
	public String toXML() {
		
		String xml;
		
			xml = "<addonModule addonId='" + addonId + "' " + getBaseXML() + ">" + getLayoutXML();
			
			xml +="<properties>";
			for(IAddonParam property: addonParams){
				xml += property.toXML();
			}
			xml +="</properties>";
			
			xml +="</addonModule>";
		
		return xml;
	}


	public String getAddonId() {
		return addonId;
	}


	public void setAddonId(String id) {
		this.addonId = id;
	}


	public void addAddonParam(String name, String displayName, String type) {
		AddonParamFactory paramFactory = new AddonParamFactory();
		IAddonParam addonParam = paramFactory.createAddonParam(this, type);
		addonParam.setName(name);
		addonParam.setDisplayName(displayName);
		
		addAddonParam(addonParam);
	}


	public void addAddonParam(IAddonParam param) {

		addonParams.add(param);
		addProperty(param.getAsProperty());
	}


	public String getBaseURL() {
		return baseURL;
	}
	
	public List<IAddonParam> getParams(){
		return addonParams;
	}
}
