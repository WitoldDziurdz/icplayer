package com.lorepo.icplayer.client.content.service;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import com.lorepo.icplayer.client.content.services.ScoreService;
import com.lorepo.icplayer.client.module.api.player.PageScore;

public class ScoreServiceTestCase {

	@Test
	public void totalScore() {
		
		ScoreService scoreService = new ScoreService(true);
		PageScore pageScore1 = new PageScore("Page 1", 3, 5);
		scoreService.setPageScore(pageScore1);
		PageScore pageScore2 = new PageScore("Page 2", 4, 8);
		scoreService.setPageScore(pageScore2);
		
		assertEquals(7, scoreService.getTotalScore());
		assertEquals(13, scoreService.getTotalMaxScore());
	}

	@Test
	public void historyFirst() {
		
		ScoreService scoreService = new ScoreService(false);
		PageScore pageScore1 = new PageScore("Page 1", 3, 5);
		scoreService.setPageScore(pageScore1);
		assertEquals(3, scoreService.getTotalScore());
		assertEquals(5, scoreService.getTotalMaxScore());

		pageScore1 = new PageScore("Page 1", 4, 8);
		scoreService.setPageScore(pageScore1);
		
		PageScore pageScore = scoreService.getPageScore("Page 1");
		assertEquals(3, pageScore.getScore(), 0.1);
		assertEquals(5, pageScore.getMaxScore(), 0.1);
	}

	@Test
	public void historyLast() {
		
		ScoreService scoreService = new ScoreService(true);
		PageScore pageScore1 = new PageScore("Page 1", 3, 5);
		scoreService.setPageScore(pageScore1);
		assertEquals(3, scoreService.getTotalScore());
		assertEquals(5, scoreService.getTotalMaxScore());

		pageScore1 = new PageScore("Page 1", 4, 8);
		scoreService.setPageScore(pageScore1);
		
		PageScore pageScore = scoreService.getPageScore("Page 1");
		assertEquals(4, pageScore.getScore(), 0.1);
		assertEquals(8, pageScore.getMaxScore(), 0.1);
	}
}
