import {PlayButton} from "./playButton.jsm";
import {State} from "./state.jsm";
import {RecordButton} from "./recordButton.jsm";
import {Timer} from "./timer.jsm";
import {RecorderFactory} from "./recorder/recorderFactory.jsm";
import {PlayerFactory} from "./player/playerFactory.jsm";
import {RecordTimeLimiter} from "./recordTimeLimiter.jsm";
import {validateModel} from "./validator.jsm";
import {RecordButtonDecoratorFactory} from "./recordButtonDecorator/recordButtonDecoratorFactory.jsm";
import {DefaultRecordingLoader} from "./defaultRecordingLoader.jsm";
import {SoundIntensity} from "./soundIntensity.jsm";
import {MediaMediatorFactory} from "./mediaMediator/mediaMediatorFactory.jsm";

export class MediaRecorder {

    DEFAULT_VALUES = {
        MAX_TIME: 60,
        SUPPORTED_TYPES: ['audio', 'video']
    };

    ERROR_CODES = {
        "maxTime_INT02": "Time value contains non numerical characters",
        "maxTime_INT04": "Time in seconds cannot be negative value",
        "type_EV01": "Selected type is not supported"
    };

    run(view, model) {
        this.view = view;
        this.model = model;

        this.initialize();

        this.playButton.activate();
        this.recordButton.activate();
    }

    createPreview(view, model) {
        this.view = view;
        this.model = model;

        this.initialize();
    }

    initialize() {
        this.validateModel = validateModel;
        let validatedModel = this.validateModel(this.model, this.DEFAULT_VALUES);

        if (!validatedModel.isValid) {
            DOMOperationsUtils.showErrorMessage(this.view, this.ERROR_CODES, this.validateModel.fieldName.join("|") + "_" + this.validateModel.errorCode);
            return;
        }

        this.configuration = validatedModel.value;
        this.state = new State();

        let $player = $(this.view).find(".media-recorder-player-wrapper");
        let $timer = $(this.view).find(".media-recorder-timer");
        let $soundIntensity = $(this.view).find(".media-recorder-sound-intensity");
        let $recordButton = $(this.view).find(".media-recorder-recording-button");
        let $playButton = $(this.view).find(".media-recorder-play-button");

        this.timer = new Timer($timer);
        this.soundIntensity = new SoundIntensity($soundIntensity);

        this.playerFactory = new PlayerFactory($player, this.timer, this.soundIntensity, this.ERROR_CODES.type_EV01);
        this.player = this.playerFactory.createPlayer(this.configuration.type);

        this.recorderFactory = new RecorderFactory(this.ERROR_CODES.type_EV01);
        this.recorder = this.recorderFactory.createRecorder(this.configuration.type);

        this.mediaMediatorFactory = new MediaMediatorFactory(this.player, this.recorder, this.timer, this.soundIntensity, this.ERROR_CODES.type_EV01);
        this.mediaMediator = this.mediaMediatorFactory.createMediaMediator();
        this.mediaMediator.runMediation();

        this.recordTimeLimiter = new RecordTimeLimiter(this.configuration.maxTime);

        this.playButton = new PlayButton($playButton, this.state, this.timer, this.player, this.soundIntensity);

        this.recordButton = new RecordButton($recordButton, this.state, this.timer, this.recorder, this.recordTimeLimiter);
        this.recordButtonDecoratorFactory = new RecordButtonDecoratorFactory($player, this.configuration.startRecordingSound, this.configuration.stopRecordingSound);
        this.recordButton = this.recordButtonDecoratorFactory.decorateStartRecordingSoundEffect(this.recordButton);
        this.recordButton = this.recordButtonDecoratorFactory.decorateStopRecordingSoundEffect(this.recordButton);

        this.player.onEndedPlaying = () => this.playButton.forceClick();
        this.recordTimeLimiter.onTimeExpired = () => this.recordButton.forceClick();

        this.defaultRecordingLoader = new DefaultRecordingLoader(this.player, this.timer, this.state);
        this.defaultRecordingLoader.loadDefaultRecording(this.configuration.defaultRecording);
    }
}