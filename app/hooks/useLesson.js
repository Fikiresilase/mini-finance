import { useContext, useEffect, useState } from "react";
import AuthContext from "../auth/authContext";
import apiClient from "../services/apiClient";

const useLesson = (route) => {
  const authContext = useContext(AuthContext);
  const courseId = route.params.courseId;
  const [error, setError] = useState(null); 
  const [lessonTitle, setLessonTitle] = useState(null);
  const [content, setContent] = useState(null);
  const [shortNotice, setShortNotice] = useState(null);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      const userId = authContext.user.id;
      try {
        const response = await apiClient.get('/lesson/content', {
          params: { courseId, userId }
        });
        const { lessonTitle, mainLesson, shortNotice, quizQuestion } = response.data;

        setLessonTitle(lessonTitle);
        setContent(mainLesson);
        setShortNotice(shortNotice);
        setQuizQuestion(quizQuestion);
      } catch (error) {
        setError('Failed to fetch content. Please try again. ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson(); 

    
  }, [route.params]);

  return { 
    lessonTitle, 
    content, 
    shortNotice, 
    setShortNotice, 
    quizQuestion, 
    loading, 
    error, 
    setError 
  };
};

export default useLesson;