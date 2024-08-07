import axios from "axios";

export default class EditorImages {
  constructor(element, virtualElement, ...[isLoading, isLoaded, handleAlertOpen]) {
    this.element = element;
    this.virtualElement = virtualElement;
    this.element.addEventListener('click', () => this.onClick());
    this.imgUploader = document.querySelector('#img-upload');
    this.isLoading = isLoading;
    this.isLoaded = isLoaded;
    this.handleAlertOpen = handleAlertOpen;
  }

  onClick() {
    this.imgUploader.click();
    this.imgUploader.addEventListener('change', () => {
      if(this.imgUploader.files && this.imgUploader.files[0]) {
        let formData = new FormData();
        formData.append('image', this.imgUploader.files[0]);
        this.isLoading();

        axios
          .post('./api/uploadImages.php', formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then((res) => {
            this.virtualElement.src = this.element.src = `./img/${res.data.src}`;
            this.handleAlertOpen('success');
          })
          .catch(() => {
            this.isLoaded();
            this.handleAlertOpen('warning');
          })
          .finally(() => {
            this.imgUploader.value = '';
            this.isLoaded();
          })
      }
    })
  }
}