import { useState, useContext, useEffect } from "react";
import AuthContext from "../auth/authContext";
import apiClient from "../services/apiClient";

const useProgress = (route) => {
  const authContext = useContext(AuthContext);
  const [progress, setProgress] = useState(0); 
  const [track, setTrack] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!authContext.user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const courseId = route.params.courseId;
        const userId = authContext.user.id;
        const lessonTrackResponse = await apiClient.get('/user/course/track', {
          params: { userID: userId, courseId: courseId },
        });
        const { progress, track } = lessonTrackResponse.data;
        setProgress(progress || 0); 
        setTrack(track || []); 
        console.log("Fetched track:", track);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [route.params.courseId, authContext.user?.id]); 

  return { progress, setProgress, track, setTrack, loading };
};

export default useProgress;