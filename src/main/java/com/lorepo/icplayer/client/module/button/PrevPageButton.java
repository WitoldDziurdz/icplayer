package com.lorepo.icplayer.client.module.button;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.lorepo.icplayer.client.module.api.player.IPlayerCommands;
import com.lorepo.icplayer.client.module.api.player.IPlayerServices;

class PrevPageButton extends ExecutableButton {
	boolean goToLastVisitedPage = false;
	private IPlayerServices services = null;
	
	public PrevPageButton(IPlayerServices services, final boolean goToLastPage){
		
		setStyleName("ic_button_prevpage");

		if(services != null) {
			this.services = services;
			this.goToLastVisitedPage = goToLastPage;
			
			if(services.getCurrentPageIndex() == 0 && !goToLastPage) {
				setEnabled(false);
			}
			
			addClickHandler(new ClickHandler() {
				public void onClick(ClickEvent event) {
					event.stopPropagation();
					event.preventDefault();
					execute();
				}
			});
		}
	}

	public void execute() {
		IPlayerCommands playerCommands = services.getCommands();
		if(!this.goToLastVisitedPage) {
			playerCommands.prevPage();
		}
		else {
			playerCommands.goToLastVisitedPage();
		}
	}
}
