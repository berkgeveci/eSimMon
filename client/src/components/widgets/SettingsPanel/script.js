import SaveDialog from "../SaveDialog";
import LoadDialog from "../LoadDialog";
import { mapActions, mapGetters, mapMutations } from "vuex";

export default {
  inject: ["girderRest"],

  components: {
    SaveDialog,
    LoadDialog,
  },

  data() {
    return {
      showSaveDialog: false,
      showLoadDialog: false,
    };
  },

  props: {
    plots: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    ...mapActions({
      toggleSyncZoom: "UI_TOGGLE_ZOOM_SYNC",
      toggleSelectTimeStep: "UI_TOGGLE_TIME_STEP",
      fetchAllViews: "VIEWS_FETCH_ALL_AVAILABLE",
      toggleShowSettings: "UI_TOGGLE_SHOW_SETTINGS",
      toggleRunGlobals: "UI_TOGGLE_RUN_GLOBALS",
      toggleXAxis: "UI_TOGGLE_X_AXIS",
      toggleYAxis: "UI_TOGGLE_Y_AXIS",
      toggleScalarBar: "UI_TOGGLE_SCALAR_BAR",
      toggleTitle: "UI_TOGGLE_TITLE",
      toggleLegend: "UI_TOGGLE_LEGEND",
    }),
    ...mapMutations({
      setPaused: "UI_PAUSE_GALLERY_SET",
      setLoadDialogVisible: "UI_SHOW_LOAD_DIALOG_SET",
      setSaveDialogVisible: "UI_SHOW_SAVE_DIALOG_SET",
      toggleSettingsVisibility: "UI_SHOW_SETTINGS_SET",
      setAutoSaveDialogEnabled: "UI_AUTO_SAVE_DIALOG_ENABLED_SET",
      setRangeTooltipEnabled: "UI_SHOW_RANGE_TOOLTIP_SET",
    }),
    async saveView() {
      await this.fetchAllViews();
      this.setSaveDialogVisible(true);
      this.setPaused(true);
    },
    async loadView() {
      await this.fetchAllViews();
      this.setLoadDialogVisible(true);
    },
  },

  computed: {
    ...mapGetters({
      enableRangeTooltip: "UI_SHOW_RANGE_TOOLTIP",
      showLegend: "UI_SHOW_LEGEND",
      showScalarBar: "UI_SHOW_SCALAR_BAR",
      showYAxis: "UI_SHOW_Y_AXIS",
      showXAxis: "UI_SHOW_X_AXIS",
      useRunGlobals: "UI_USE_RUN_GLOBALS",
      showAutoSaveDialog: "UI_AUTO_SAVE_DIALOG_ENABLED",
      syncZoom: "UI_ZOOM_SYNC",
      showTitle: "UI_SHOW_TITLE",
      showSettings: "UI_SHOW_SETTINGS",
      timeStepSelectorMode: "UI_TIME_STEP_SELECTOR",
      lastSaved: "VIEWS_LAST_SAVED",
      numcols: "VIEWS_COLUMNS",
      numrows: "VIEWS_ROWS",
      run: "VIEWS_RUN_ID",
      simulation: "VIEWS_SIMULATION",
      step: "VIEW_TIME_STEP",
    }),
    zoomSync: {
      get() {
        return this.syncZoom;
      },
      set() {
        this.toggleSyncZoom();
      },
    },
    selectTimeStep: {
      get() {
        return this.timeStepSelectorMode;
      },
      set() {
        this.toggleSelectTimeStep();
      },
    },
    autoSavePrompt: {
      get() {
        return this.showAutoSaveDialog;
      },
      set(val) {
        this.setAutoSaveDialogEnabled(val);
      },
    },
    runGlobals: {
      get() {
        return this.useRunGlobals;
      },
      set() {
        this.toggleRunGlobals();
      },
    },
    xAxis: {
      get() {
        return this.showXAxis;
      },
      set() {
        this.toggleXAxis();
      },
    },
    yAxis: {
      get() {
        return this.showYAxis;
      },
      set() {
        this.toggleYAxis();
      },
    },
    scalarBar: {
      get() {
        return this.showScalarBar;
      },
      set() {
        this.toggleScalarBar();
      },
    },
    legend: {
      get() {
        return this.showLegend;
      },
      set() {
        this.toggleLegend();
      },
    },
    title: {
      get() {
        return this.showTitle;
      },
      set() {
        this.toggleTitle();
      },
    },
    rangeInfo: {
      get() {
        return this.enableRangeTooltip;
      },
      set(val) {
        this.setRangeTooltipEnabled(val);
      },
    },
  },
};
