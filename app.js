// ═══ Student Dashboard — Vue App (Options API) ═══

const API_URL = "http://localhost:8000/api";

Vue.createApp({

    data() {
        return {
            // ═══ Auth ═══
            // TODO: username, password, isLoggedIn, loginError
            username: "",
            password: "",
            isLoggedIn: false,
            loginError: "",

            // ═══ Students ═══
            // TODO: students (array), isLoading (boolean), searchTerm (string)
            students: [],
            courses: [],
            isLoading: false,
            searchTerm: "",
            selectedGrade: "",
            showFilters: false,
            createError: "",
            tokenRefreshIntervalId: null,

            // ═══ New Student Form ═══
            // TODO: newName, newEmail, newGrade, newCourseId
            newName: "",
            newEmail: "",
            newGrade: "N/A",
            newCourseId: ""
        };
    },

    computed: {
        // TODO: filteredStudents — return students filtered by searchTerm
        // If searchTerm is empty, return all students
        // Otherwise filter where name includes searchTerm (case-insensitive)
        filteredStudents() {
            const term = this.searchTerm.trim().toLowerCase();
            return this.students.filter((student) => {
                const matchesSearch =
                    term === "" ||
                    (student.name || "").toLowerCase().includes(term) ||
                    (student.email || "").toLowerCase().includes(term);
                const matchesGrade = this.selectedGrade === "" || student.grade === this.selectedGrade;
                return matchesSearch && matchesGrade;
            });
        }
    },

    methods: {
        // ═══ Auth ═══

        // TODO: handleLogin()
        // POST to API_URL + "/token/" with username and password
        // If successful: store token in localStorage, set isLoggedIn = true, call this.loadStudents()
        // If failed: set loginError message
        async handleLogin() {
            this.loginError = "";

            try {
                const response = await fetch(API_URL + "/token/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username: this.username, password: this.password })
                });

                if (!response.ok) {
                    this.loginError = "Invalid username or password.";
                    return;
                }

                const data = await response.json();
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);

                this.isLoggedIn = true;
                this.startTokenRefresh();
                await this.loadCourses();
                await this.loadStudents();
            } catch (error) {
                this.loginError = "The request failed before login completed. Check backend and CORS settings.";
            }
        },

        // TODO: logout()
        // Clear localStorage, set isLoggedIn = false
        logout() {
            this.stopTokenRefresh();
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            this.isLoggedIn = false;
            this.password = "";
            this.students = [];
            this.courses = [];
            this.createError = "";
        },

        // ═══ Students ═══

        // TODO: loadStudents()
        // GET from API_URL + "/students/" with Authorization header
        // Set this.students with the response
        // Handle isLoading state
        async loadStudents() {
            this.isLoading = true;
            try {
                const response = await fetch(API_URL + "/students/", {
                    headers: {
                        "Authorization": "Bearer " + this.getToken()
                    }
                });
                const data = await response.json();
                this.students = Array.isArray(data) ? data : (data.results || []);
            } finally {
                this.isLoading = false;
            }
        },

        async loadCourses() {
            const response = await fetch(API_URL + "/courses/", {
                headers: {
                    "Authorization": "Bearer " + this.getToken()
                }
            });

            if (!response.ok) {
                this.courses = [];
                return;
            }

            const data = await response.json();
            this.courses = Array.isArray(data) ? data : (data.results || []);
            if (this.courses.length > 0 && !this.newCourseId) {
                this.newCourseId = String(this.courses[0].id);
            }
        },

        // TODO: addStudent()
        // POST to API_URL + "/students/" with form data
        // Clear the form fields after success
        // Call this.loadStudents() to refresh
        async addStudent() {
            this.createError = "";
            const payload = {
                name: this.newName,
                email: this.newEmail,
                grade: this.newGrade,
                course: Number(this.newCourseId)
            };

            try {
                const response = await fetch(API_URL + "/students/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + this.getToken()
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const firstError = Object.values(errorData)[0];
                    this.createError = Array.isArray(firstError) ? firstError[0] : "Unable to create student.";
                    return;
                }

                this.newName = "";
                this.newEmail = "";
                this.newGrade = "N/A";
                await this.loadStudents();
            } catch (error) {
                this.createError = "Unable to create student.";
            }
        },

        // TODO: deleteStudent(id)
        // DELETE to API_URL + "/students/" + id + "/"
        // Remove from this.students array after success
        async deleteStudent(id) {
            const response = await fetch(API_URL + "/students/" + id + "/", {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + this.getToken()
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                }
                return;
            }

            this.students = this.students.filter((student) => student.id !== id);
        },

        resetFilters() {
            this.searchTerm = "";
            this.selectedGrade = "";
        },

        async refreshAccessToken() {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                this.logout();
                return false;
            }

            try {
                const response = await fetch(API_URL + "/token/refresh/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ refresh: refreshToken })
                });

                if (!response.ok) {
                    this.logout();
                    return false;
                }

                const data = await response.json();
                localStorage.setItem("access_token", data.access);
                return true;
            } catch (error) {
                this.logout();
                return false;
            }
        },

        startTokenRefresh() {
            this.stopTokenRefresh();
            this.tokenRefreshIntervalId = setInterval(() => {
                this.refreshAccessToken();            
            }, 5 * 60 * 1000);
        },

        stopTokenRefresh() {
            if (this.tokenRefreshIntervalId) {
                clearInterval(this.tokenRefreshIntervalId);
                this.tokenRefreshIntervalId = null;
            }
        },

        // ═══ Helper ═══

        getToken() {
            return localStorage.getItem("access_token");
        },

        getRefreshToken() {
            return localStorage.getItem("refresh_token");
        }
    },

    mounted() {
        // TODO: check if a token exists in localStorage
        // If yes: set isLoggedIn = true and call this.loadStudents()
        if (this.getToken()) {
            this.isLoggedIn = true;
            this.startTokenRefresh();
            this.loadCourses();
            this.loadStudents();
        }
    },

    beforeUnmount() {
        this.stopTokenRefresh();
    }

}).mount("#app");
