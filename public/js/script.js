Vue.component("image-modal", {
    props: ["id"],
    data: function() {
        return {
            image: [],
            comment: "",
            username: "",
            comments: []
        };
    },
    methods: {
        closeModal: function() {
            this.$emit("close");
        },
        submitComment: function(e) {
            e.preventDefault();
            var submit = this;
            axios
                .post("/comment", {
                    imageId: submit.id,
                    comment: submit.comment,
                    username: submit.username
                })
                .then(function(resp) {
                    console.log(
                        "comment resp: ",
                        resp.data.comment,
                        resp.data.username
                    );
                    submit.comments.unshift(resp.data);
                    submit.comment = "";
                });
        }
    },
    mounted: function() {
        var component = this;
        axios
            .get("/image/" + this.id)
            .then(function(resp) {
                if (!resp.data.success) {
                    component.closeModal();
                } else {
                    component.image = resp.data.image;
                    component.comments = resp.data.comments;
                }
            })
            .catch(function(err) {
                console.log(err);
            });
    },
    watch: {
        id: function() {
            var component = this;
            axios
                .get("/image/" + this.id)
                .then(function(resp) {
                    if (!resp.data.success) {
                        component.closeModal();
                    } else {
                        component.image = resp.data.image;
                        component.comments = resp.data.comments;
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    },
    template: "#image-modal-template"
});

new Vue({
    el: "main",
    data: {
        imgFormInfo: {
            title: "",
            description: "",
            username: "",
            img: null
        },
        currentImageId: location.hash.slice(1),
        images: []
    },
    methods: {
        selectFile: function(e) {
            this.imgFormInfo.img = e.target.files[0];
        },
        uploadImage: function(e) {
            e.preventDefault();
            var fd = new FormData();
            fd.append("title", this.imgFormInfo.title);
            fd.append("description", this.imgFormInfo.description);
            fd.append("username", this.imgFormInfo.username);
            fd.append("file", this.imgFormInfo.img);
            axios.post("/upload", fd).then(resp => {
                console.log("upload resp: ", resp.data);
                this.images.unshift(resp.data.image);
                this.imgFormInfo.title = "";
                this.imgFormInfo.description = "";
            });
        },
        closeModal: function() {
            location.hash = "";
        },
        moreImages: function() {
            var self = this;
            var lastImageId = self.images[self.images.length - 1];
            console.log(self.images[self.images.length - 1]);
            axios.get("/images/" + lastImageId.id).then(function(resp) {
                self.images = self.images.concat(resp.data.images);
            });
        }
    },
    created: function() {
        var self = this;
        addEventListener("hashchange", function() {
            self.currentImageId = location.hash.slice(1);
        });
    },
    mounted: function() {
        var me = this;
        axios.get("/images").then(function(resp) {
            me.images = resp.data.images;
        });
    }
});
