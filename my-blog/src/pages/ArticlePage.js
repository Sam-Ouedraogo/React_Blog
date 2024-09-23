import { useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import CommentList from "../components/CommentsList";
import addCommentForm from "../components/addCommentForm";
import useUser from "../hooks/useUser";
import articles from "./article-content";
import { useState, useEffect } from "react"; //add state hook and to load data fron server (for logic)  to component
import axios from "axios";
import AddCommentForm from "../components/addCommentForm";

const ArticlePage = () => {
  const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [] });
  const { articleId } = useParams();
  const { user, isLoading } = useUser();

  useEffect(() => {
    const loadArticleInfo = async () => {
      const token = user && (await user.getIdToken());
      const headers = token ? { authtoken: token } : {};
      const response = await axios.get(`/api/articles/${articleId}`, {
        headers,
      });
      const newArticleInfo = response.data;
      setArticleInfo(newArticleInfo);
    };
    loadArticleInfo();
  }, []);

  const article = articles.find((article) => article.name === articleId);
  const addUpvote = async () => {
    const token = user && (await user.getIdToken());
    const headers = token ? { authtoken: token } : {};
    const response = await axios.put(
      `/api/articles/${articleId}/upvote`,
      null,
      { headers }
    );
    const updatedArticle = response.data;
    setArticleInfo(updatedArticle);
  };

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <>
      <h1>{article.title}</h1>
      <div className="upvotes-section">
        {user ? (
          <button onClick={addUpvote}>Upvote</button>
        ) : (
          <button>Log in to upvote </button>
        )}

        <p>This article has {articleInfo.upvotes} upvote(s)</p>
      </div>

      {article.content.map(
        (
          paragraph,
          i // Here map takes the paragraph and its index
        ) => (
          <p key={i}> {paragraph}</p>
        )
      )}
      {user ? (
        <AddCommentForm
          articleName={articleId}
          onArticleUpdated={(updatedArticle) => setArticleInfo(updatedArticle)}
        />
      ) : (
        <button>Log in to add a comment </button>
      )}

      <CommentList comments={articleInfo.comments} />
    </>
  );
};

export default ArticlePage;
