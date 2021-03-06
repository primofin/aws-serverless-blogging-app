/* eslint-disable @typescript-eslint/no-explicit-any */
import { API, graphqlOperation } from 'aws-amplify';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getPost, listPosts } from '../../graphql/queries';
import { Post, PostState } from '../../common/types';
import { createPost } from '../../graphql/mutations';

const extraActions = createExtraActions();

export const postSlice = createSlice({
  name: 'posts',
  initialState: {
    isLoading: null,
    posts: [],
    selectedPost: undefined,
    error: undefined,
  } as PostState,
  reducers: {},
  extraReducers: createExtraReducers(),
});

function createExtraActions() {
  return {
    getAllPosts: getAllPosts(),
    addNewPost: addNewPost(),
    getPostById: getPostById(),
  };

  function getAllPosts() {
    return createAsyncThunk(`posts/getAllPosts`, async () => {
      const { data } = (await API.graphql(graphqlOperation(listPosts))) as any;
      const posts = data.listPosts.items as Post[];
      console.log('posts', data.listPosts.items);

      return posts;
    });
  }

  function getPostById() {
    return createAsyncThunk<Post, string>(`posts/getPostById`, async (id) => {
      const { data } = (await API.graphql(graphqlOperation(getPost, { id }))) as any;
      const post = data.getPost as Post;
      return post;
    });
  }

  function addNewPost() {
    return createAsyncThunk<Post, { title: string; content: string; userPostsId: string }>(
      'posts/createPost',
      async (initialPost) => {
        const { data } = (await API.graphql(
          graphqlOperation(createPost, { input: initialPost })
        )) as any;
        console.log('add new post data', data);
        return data;
      }
    );
  }
}

function createExtraReducers() {
  return {
    ...getAllPosts(),
    ...getPostById(),
    ...createPost(),
  };

  function getAllPosts() {
    const { pending, fulfilled, rejected } = extraActions.getAllPosts;
    return {
      [pending as any]: (state: PostState) => {
        state.isLoading = true;
      },
      [fulfilled as any]: (state: PostState, action: PayloadAction<Post[]>) => {
        state.posts = action.payload;
        state.isLoading = false;
      },
      [rejected as any]: (state: PostState, action: any) => {
        console.log('Get All Posts Error', action.error);
        state.error = { error: action.error };
      },
    };
  }

  function createPost() {
    const { pending, fulfilled, rejected } = extraActions.addNewPost;
    return {
      [pending as any]: (state: PostState) => {
        state.isLoading = true;
      },
      [fulfilled as any]: (state: PostState, action: PayloadAction<Post>) => {
        state.posts = [...state.posts, action.payload];
        state.isLoading = false;
      },
      [rejected as any]: (state: PostState, action: any) => {
        console.log('Create Post Error', action.error);
        state.error = { error: action.error };
      },
    };
  }

  function getPostById() {
    const { pending, fulfilled, rejected } = extraActions.getPostById;
    return {
      [pending as any]: (state: PostState) => {
        state.isLoading = true;
      },
      [fulfilled as any]: (state: PostState, action: PayloadAction<Post>) => {
        state.selectedPost = action.payload;
        state.isLoading = false;
      },
      [rejected as any]: (state: PostState, action: any) => {
        console.log('getPostById Error', action.error);
        state.error = { error: action.error };
      },
    };
  }
}

export const { getAllPosts, addNewPost, getPostById } = extraActions;

export default postSlice.reducer;
