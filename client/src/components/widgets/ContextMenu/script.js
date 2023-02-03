import RangeDialog from "../RangeDialog";
import DownloadOptions from "../DownloadOptions";
import { v4 as uuidv4 } from "uuid";
import { mapActions, mapGetters, mapMutations } from "vuex";

// Enum values
const REQUEST = "in progress";
const COMPLETE = "complete";
const FAIL = "failed";

export default {
  name: "ContextMenu",
  inject: ["girderRest", "fastRestUrl"],

  components: {
    RangeDialog,
    DownloadOptions,
  },

  data() {
    return {
      showRangeDialog: false,
      downloads: [],
      averageDialog: false,
      range: "",
    };
  },

  watch: {
    averageDialog: {
      immediate: true,
      handler(visible) {
        if (visible) {
          this.setPaused(true);
        }
      },
    },
  },

  computed: {
    ...mapGetters({
      visible: "UI_SHOW_CONTEXT_MENU",
      itemInfo: "UI_CONTEXT_MENU_ITEM_DATA",
      plotDetails: "PLOT_DETAILS",
      mathJaxOptions: "UI_MATH_JAX_OPTIONS",
      minTimeStep: "PLOT_MIN_TIME_STEP",
      maxTimeStep: "PLOT_MAX_TIME_STEP",
    }),
    showMenu: {
      get() {
        return this.visible;
      },
      set(value) {
        this.showContextMenu(value);
      },
    },
    pos() {
      if (this.itemInfo) {
        return [this.itemInfo.event.clientX, this.itemInfo.event.clientY];
      }
      return [0, 0];
    },
    parameter() {
      return this.itemInfo ? this.itemInfo.name : "";
    },
    downloading() {
      return this.downloads.length > 0;
    },
    invalidInput() {
      let range = Number(this.range);
      return range < 0 && range > this.maxRange;
    },
    maxRange() {
      return this.maxTimeStep - this.minTimeStep;
    },
    averaging() {
      return this.itemInfo ? this.itemInfo?.averaging : false;
    },
  },

  methods: {
    ...mapActions({
      updatePlotDetails: "PLOT_DETAILS_UPDATED",
    }),
    ...mapMutations({
      showContextMenu: "UI_SHOW_CONTEXT_MENU_SET",
      updateItemInfo: "UI_CONTEXT_MENU_ITEM_DATA_SET",
      showDownloadOptions: "UI_SHOW_DOWNLOAD_OPTIONS_SET",
      plotTimeAverageChanged: "PLOT_TIME_AVERAGE_SET",
      setPaused: "UI_PAUSE_GALLERY_SET",
    }),
    fetchImage(format) {
      const { id, step } = this.itemInfo;
      const endpoint = `variables/${id}/timesteps/${step}/image?format=${format}`;
      this.downloadData(endpoint, format, "image");
    },
    fetchImages(format, timeSteps = null) {
      const { id } = this.itemInfo;
      let endpoint = `variables/${id}/timesteps/image?format=${format}`;
      if (timeSteps) {
        endpoint = `${endpoint}&selectedTimeSteps=${JSON.stringify(timeSteps)}`;
      }
      this.downloadData(endpoint, "zip", "image");
    },
    fetchMovie(format, timeSteps = null) {
      const { id } = this.itemInfo;
      let endpoint = `variables/${id}/timesteps/movie?format=${format}`;
      if (timeSteps) {
        endpoint = `${endpoint}&selectedTimeSteps=${JSON.stringify(timeSteps)}`;
      }
      this.downloadData(endpoint, format, "movie");
    },
    downloadData(endpoint, format, type) {
      const uuid = uuidv4();
      this.updateItemInfo({ ...this.itemInfo, uuid });
      const { name } = this.itemInfo;
      this.downloads.push({ type, uuid, name, status: REQUEST });
      let details = this.plotDetails[`${this.itemInfo.id}`];
      details = details ? `&details=${JSON.stringify(details)}` : "";
      this.girderRest
        .get(`${this.fastRestUrl}/${endpoint}${details}`, {
          responseType: "blob",
        })
        .then((response) => {
          let idx = this.downloads.findIndex((d) => d.uuid === uuid);
          this.$set(this.downloads, idx, {
            ...this.downloads[idx],
            status: COMPLETE,
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${name}.${format}`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(() => {
          let idx = this.downloads.findIndex((d) => d.uuid === uuid);
          this.$set(this.downloads, idx, {
            ...this.downloads[idx],
            status: FAIL,
          });
        })
        .finally(() => {
          // Clean up the notifications no matter the result
          setTimeout(() => {
            let idx = this.downloads.findIndex((d) => {
              return d.uuid === uuid && d.status !== REQUEST;
            });
            if (idx >= 0) {
              this.downloads.splice(idx, 1);
            }
          }, 5000);
        });
    },
    dismiss(idx) {
      this.downloads.splice(idx, 1);
    },
    downloadOptions() {
      this.showDownloadOptions(true);
    },
    clearGallery() {
      this.itemInfo.clearGallery();
    },
    useAverage(clear = false) {
      this.averageDialog = false;
      if (clear) {
        this.range = 0;
      }
      this.updatePlotDetails({
        [`${this.itemInfo.id}`]: { timeAverage: Number(this.range) },
      });
      this.plotTimeAverageChanged(this.itemInfo.id);
    },
    notTimeSeries() {
      const xAxis = this.itemInfo?.xAxis || "";
      return !xAxis.toLowerCase().includes("time");
    },
  },
};
