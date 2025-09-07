import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { userService } from '../services/users';
import type { User } from '../types/api';

/**
 * Hook for managing profile image operations
 */
export const useProfileImage = (userId: number) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Upload profile image mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      return userService.uploadProfileImage(userId, file);
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(['user', userId], (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              profile_image_url: data.data.profile_image_url
            }
          };
        }
        return oldData;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi upload',
        description: error.message || 'Không thể upload ảnh',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Delete profile image mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);
      return userService.deleteProfileImage(userId);
    },
    onSuccess: () => {
      // Update user data in cache
      queryClient.setQueryData(['user', userId], (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              profile_image_url: null
            }
          };
        }
        return oldData;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });

      toast({
        title: 'Thành công',
        description: 'Đã xóa ảnh đại diện',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi xóa ảnh',
        description: error.message || 'Không thể xóa ảnh',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Upload handler with validation
  const uploadImage = useCallback(async (file: File) => {
    // Validate file
    const validation = userService.validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: 'File không hợp lệ',
        description: validation.errors.join(', '),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    await uploadMutation.mutateAsync(file);
  }, [uploadMutation, toast]);

  // Delete handler
  const deleteImage = useCallback(async () => {
    await deleteMutation.mutateAsync();
  }, [deleteMutation]);

  return {
    uploadImage,
    deleteImage,
    isUploading: isUploading || uploadMutation.isPending || deleteMutation.isPending,
    isUploadError: uploadMutation.isError,
    isDeleteError: deleteMutation.isError,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error,
    isUploadSuccess: uploadMutation.isSuccess,
    isDeleteSuccess: deleteMutation.isSuccess,
  };
};

/**
 * Hook for getting user's profile image URL
 */
export const useProfileImageUrl = (user: User | null) => {
  return {
    profileImageUrl: user?.profile_image_url || null,
    hasProfileImage: !!user?.profile_image_url,
    fallbackUrl: user ? 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=150&background=random` :
      null
  };
};