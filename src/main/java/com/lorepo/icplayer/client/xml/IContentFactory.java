package com.lorepo.icplayer.client.xml;
import com.lorepo.icf.utils.ILoadListener;
import com.lorepo.icplayer.client.model.Content;

public interface IContentFactory {	
	public void load(String fetchUrl, final ILoadListener listener);
	public String dumps(Content content);
}
