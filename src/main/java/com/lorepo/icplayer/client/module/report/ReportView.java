package com.lorepo.icplayer.client.module.report;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.KeyDownEvent;
import com.google.gwt.user.client.ui.Composite;
import com.google.gwt.user.client.ui.Grid;
import com.google.gwt.user.client.ui.HTMLTable.Cell;
import com.lorepo.icf.utils.TextToSpeechVoice;
import com.lorepo.icplayer.client.framework.module.StyleUtils;
import com.lorepo.icplayer.client.module.api.player.PageScore;
import com.lorepo.icplayer.client.module.report.ReportPresenter.IDisplay;
import com.lorepo.icplayer.client.utils.widget.ProgressBar;
import com.lorepo.icplayer.client.module.IWCAG;
import com.lorepo.icplayer.client.module.IWCAGModuleView;
import com.lorepo.icplayer.client.page.PageController;


public class ReportView extends Composite implements IDisplay, IWCAG, IWCAGModuleView{

	private ReportModule module;
	private Grid grid;
	private int lastRow;
	private IViewListener listener;
	private HashMap<Integer, String> pageLinks;
	private boolean isWCAGOn = false;
	private boolean isWCAGActive = false;
	private PageController pageController;
	private int currentWCAGSelectedRowIndex = 1;
	private int currentWCAGSelectedColumnIndex = 0;
	
	static public String WCAG_SELECTED_CLASS_NAME = "keyboard_navigation_active_element";
	
	public ReportView(ReportModule module, boolean isPreview){
	
		this.module = module;
		
		createUI(isPreview);
	}
	
	private void createUI(boolean isPreview){
		
		pageLinks = new HashMap<Integer, String>();
		grid = new Grid(2, getColumnCount());
		lastRow = 1;

		grid.setStyleName("ic_report");
		StyleUtils.applyInlineStyle(grid, module);
		grid.setCellSpacing(0);

		grid.getRowFormatter().addStyleName(0, "ic_report-header");
		if(module.getPageNameWidth() > 0){
			grid.getColumnFormatter().setWidth(0, module.getPageNameWidth() + "px");
		}
		grid.setText(0, 0, module.getResultLabel());
		if(module.isShowCounters()){
			grid.setText(0, 2, module.getChecksLabel());
			grid.setText(0, 3, module.getErrorsLabel());
		}

		initWidget(grid);
		if(!isPreview){
			setVisible(module.isVisible());
		}
		getElement().setId(module.getId());
		grid.addClickHandler(new ClickHandler() {
			
			@Override
			public void onClick(ClickEvent event) {
				event.stopPropagation();
				event.preventDefault();
				Cell cell = grid.getCellForEvent(event);
				if(cell != null){
					fireEvent(cell);
				}
			}
		});
	}
	
	private int getColumnCount() {
		return module.isShowCounters() ? 4 : 2;
	}

	protected void fireEvent(Cell cell) {
		int row = cell.getRowIndex();
		if(cell.getCellIndex() == 0 && row > 0 && row < grid.getRowCount()-1){
			if(listener != null){
				String link = pageLinks.get(row);
				listener.onClicked(link);
			}
		}
	}
	
	@Override
	public void clear() {
		grid.resize(2, getColumnCount());
		lastRow = 1;
	}

	@Override
	public void addRow(String pageName, PageScore pageScore){

		appendEmptyRow();
		pageLinks.put(lastRow, pageName);
		grid.setText(lastRow, 0, pageName);
		grid.getCellFormatter().addStyleName(lastRow, 0, "ic_reportPage");

		ProgressBar progressBar = new ProgressBar();
		progressBar.setProgress(pageScore.getPercentageScore());
		String errors = pageScore.getErrorCount() + "/" + pageScore.getMistakeCount();
		grid.setWidget(lastRow, 1, progressBar);
		if(module.isShowCounters()){
			grid.setText(lastRow, 2, Integer.toString(pageScore.getCheckCount()));
			grid.setText(lastRow, 3, errors );
		}

		lastRow++;
	}

	private void appendEmptyRow() {
		grid.insertRow(lastRow);
		if(lastRow%2 > 0){
			grid.getRowFormatter().addStyleName(lastRow, "ic_report-odd");
		}
		else{
			grid.getRowFormatter().addStyleName(lastRow, "ic_report-even");
		}
	}

	@Override
	public void addRow(String pageName) {

		appendEmptyRow();
		grid.setText(lastRow, 0, pageName);
		grid.getCellFormatter().addStyleName(lastRow, 0, "ic_reportPage");

		ProgressBar progressBar = new ProgressBar();
		progressBar.setProgress(100);
		if(module.isShowCounters()){
			grid.setText(lastRow, 2, "-" );
			grid.setText(lastRow, 3, "-" );
		}
		lastRow++;
	}

	
	@Override
	public void addSummaryRow(int totalScore, int totalChecks, int totalErrors, int totalMistakes) {
	
		grid.getRowFormatter().addStyleName(lastRow, "ic_report-footer");
		grid.setText(lastRow, 0, module.getTotalLabel());
		
		ProgressBar progressBar = new ProgressBar();
		progressBar.setProgress(totalScore);
		String errors = totalErrors + "/" + totalMistakes;
		grid.setWidget(lastRow, 1, progressBar);
		if(module.isShowCounters()){
			grid.setText(lastRow, 2, Integer.toString(totalChecks) );
			grid.setText(lastRow, 3, errors );
		}
	}

	@Override
	public void addListener(IViewListener l) {
		this.listener = l;
	}

	@Override
	public String getName() {
		return "Report";
	}

	@Override
	public void setPageController(PageController pc) {
		this.setWCAGStatus(true);
		this.pageController = pc;
	}

	@Override
	public void setWCAGStatus(boolean isWCAGOn) {
		this.isWCAGOn = isWCAGOn;
	}

	@Override
	public String getLang() {
		return null;
	}
	
	private String getCellText(int x, int y){
		String cellText = grid.getText(y, x);
		if (x==3) cellText = cellText.replaceAll("/", ", ");
		return cellText;
			
	}

	private void readCell(int x, int y){
		String columnName = "";
		if(x!=0) columnName = this.module.getSpeechTextItem(x);
		this.speak(TextToSpeechVoice.create(columnName+" "+this.getCellText(x, y)));
	}
	
	private void readRow(int x, int y){
		if(x==0){
		this.speak(TextToSpeechVoice.create(grid.getText(y, 0)));
		}else{
			String columnName = this.module.getSpeechTextItem(x);
			String pageName = grid.getText(y, 0);
			this.speak(TextToSpeechVoice.create(pageName+", "+columnName+" "+this.getCellText(x, y)));
		}
	}
	
	private void move(int columnDelta, int rowDelta){
		grid.getCellFormatter().removeStyleName(currentWCAGSelectedRowIndex,currentWCAGSelectedColumnIndex,WCAG_SELECTED_CLASS_NAME);
		
		currentWCAGSelectedRowIndex+=rowDelta;
		if(currentWCAGSelectedRowIndex<1) currentWCAGSelectedRowIndex = 1;
		if(currentWCAGSelectedRowIndex>lastRow) currentWCAGSelectedRowIndex = lastRow;
		
		currentWCAGSelectedColumnIndex+=columnDelta;
		if(currentWCAGSelectedColumnIndex<0) currentWCAGSelectedColumnIndex = 0;
		if(currentWCAGSelectedColumnIndex>=this.getColumnCount()) currentWCAGSelectedColumnIndex = this.getColumnCount()-1;
		
		grid.getCellFormatter().addStyleName(currentWCAGSelectedRowIndex,currentWCAGSelectedColumnIndex,WCAG_SELECTED_CLASS_NAME);
		
		if(rowDelta==0){
			this.readCell(currentWCAGSelectedColumnIndex, currentWCAGSelectedRowIndex);
		} else {
			this.readRow(currentWCAGSelectedColumnIndex, currentWCAGSelectedRowIndex);
		}
			
	}
	
	@Override
	public void enter(boolean isExiting) {
		this.isWCAGActive = !isExiting;
		if(isExiting){
			grid.getCellFormatter().removeStyleName(currentWCAGSelectedRowIndex,currentWCAGSelectedColumnIndex,WCAG_SELECTED_CLASS_NAME);
			currentWCAGSelectedRowIndex = 1;
			currentWCAGSelectedColumnIndex = 0;
		}else{
			this.readRow(currentWCAGSelectedColumnIndex, currentWCAGSelectedRowIndex);
			grid.getCellFormatter().addStyleName(currentWCAGSelectedRowIndex,currentWCAGSelectedColumnIndex,WCAG_SELECTED_CLASS_NAME);
		}
		
	}

	@Override
	public void space(KeyDownEvent event) {}

	@Override
	public void tab(KeyDownEvent event) {
		if(currentWCAGSelectedColumnIndex==this.getColumnCount()-1){
			if(currentWCAGSelectedRowIndex==lastRow){
				this.readCell(currentWCAGSelectedColumnIndex, currentWCAGSelectedRowIndex);
				return;
			}
			this.move(1-1*this.getColumnCount(),1);
		}else{
			this.move(1,0);
		}
		
	}

	@Override
	public void left(KeyDownEvent event) {
		this.move(-1,0);
	}

	@Override
	public void right(KeyDownEvent event) {
		this.move(1,0);
		
	}

	@Override
	public void down(KeyDownEvent event) {
		this.move(0,1);
		
	}

	@Override
	public void up(KeyDownEvent event) {
		this.move(0,-1);
		
	}

	@Override
	public void escape(KeyDownEvent event) {
		grid.getCellFormatter().removeStyleName(currentWCAGSelectedRowIndex,currentWCAGSelectedColumnIndex,WCAG_SELECTED_CLASS_NAME);
		currentWCAGSelectedRowIndex = 1;
		currentWCAGSelectedColumnIndex = 0;
	}

	@Override
	public void customKeyCode(KeyDownEvent event) {}

	@Override
	public void shiftTab(KeyDownEvent event) {
		grid.getCellFormatter().removeStyleName(currentWCAGSelectedRowIndex,currentWCAGSelectedColumnIndex,WCAG_SELECTED_CLASS_NAME);
		currentWCAGSelectedRowIndex = 1;
		currentWCAGSelectedColumnIndex = 0;
	}
	
	private void speak (TextToSpeechVoice t1) {
		List<TextToSpeechVoice> textVoices = new ArrayList<TextToSpeechVoice>();
		textVoices.add(t1);
		
		this.speak(textVoices);
	}
	
	private void speak (List<TextToSpeechVoice> textVoices) {
		if (this.pageController != null) {
			this.pageController.speak(textVoices);
		}
	}
}
