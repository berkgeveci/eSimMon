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
      zoomSync: true,
      selectTimeStep: false,
      autoSavePrompt: true,
    };
  },

  props: {
    plots: {
      type: Array,
      default: () => [],
    },
  },

  watch: {
    zoomSync() {
      this.toggleSyncZoom();
    },
    selectTimeStep() {
      this.toggleSelectTimeStep();
    },
    autoSavePrompt(status) {
      this.setAutoSaveDialogEnabled(status);
    },
  },

  methods: {
    ...mapActions({
      toggleSyncZoom: "UI_TOGGLE_ZOOM_SYNC",
      toggleSelectTimeStep: "UI_TOGGLE_TIME_STEP",
      fetchAllViews: "VIEWS_FETCH_ALL_AVAILABLE",
      toggleShowSettings: "UI_TOGGLE_SHOW_SETTINGS",
    }),
    ...mapMutations({
      setPaused: "UI_PAUSE_GALLERY_SET",
      setLoadDialogVisible: "UI_SHOW_LOAD_DIALOG_SET",
      setSaveDialogVisible: "UI_SHOW_SAVE_DIALOG_SET",
      toggleSettingsVisibility: "UI_SHOW_SETTINGS_SET",
      setAutoSaveDialogEnabled: "UI_AUTO_SAVE_DIALOG_ENABLED_SET",
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
      showSettings: "UI_SHOW_SETTINGS",
      timeStepSelectorMode: "UI_TIME_STEP_SELECTOR",
      lastSaved: "VIEWS_LAST_SAVED",
      numcols: "VIEWS_COLUMNS",
      numrows: "VIEWS_ROWS",
      run: "VIEWS_RUN_ID",
      simulation: "VIEWS_SIMULATION",
      step: "VIEW_TIME_STEP",
    }),
  },
};