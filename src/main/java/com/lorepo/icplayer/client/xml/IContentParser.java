package com.lorepo.icplayer.client.xml;

import com.google.gwt.xml.client.Element;
import com.lorepo.icplayer.client.model.Content;

public interface IContentParser {
	public Content parse(Element rootNode);
}
