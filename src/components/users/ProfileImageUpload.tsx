import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Avatar,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import { FiUpload, FiTrash2, FiMoreVertical, FiCamera } from 'react-icons/fi';
import { userService } from '../../services/users';
import type { User } from '../../types/api';

interface ProfileImageUploadProps {
  user: User;
  onImageUpdate?: (newImageUrl: string | null) => void;
  canEdit?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  user,
  onImageUpdate,
  canEdit = false,
  size = 'xl'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate file trước khi upload
      const validation = userService.validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.errors.join(', '));
        return;
      }

      // Upload file
      const response = await userService.uploadProfileImage(user.id, file);
      
      // Thông báo thành công
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Callback để update UI
      onImageUpdate?.(response.data.profile_image_url);

    } catch (error: any) {
      const errorMessage = error.message || 'Không thể upload ảnh';
      setUploadError(errorMessage);
      
      toast({
        title: 'Lỗi upload',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!user.profile_image_url) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await userService.deleteProfileImage(user.id);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa ảnh đại diện',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Callback để update UI
      onImageUpdate?.(null);

    } catch (error: any) {
      const errorMessage = error.message || 'Không thể xóa ảnh';
      setUploadError(errorMessage);
      
      toast({
        title: 'Lỗi xóa ảnh',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getAvatarSrc = () => {
    if (user.profile_image_url) {
      return user.profile_image_url;
    }
    // Fallback to generated avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=150&background=random`;
  };

  return (
    <VStack spacing={4} align="center">
      <Box position="relative">
        <Avatar
          src={getAvatarSrc()}
          name={user.username}
          size={size}
          border="2px solid"
          borderColor="gray.200"
        />
        
        {canEdit && (
          <Box position="absolute" bottom={0} right={0}>
            {isUploading ? (
              <Box
                bg="blue.500"
                rounded="full"
                p={2}
                border="2px solid white"
              >
                <Spinner size="sm" color="white" />
              </Box>
            ) : (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="solid"
                  colorScheme="blue"
                  size="sm"
                  rounded="full"
                  border="2px solid white"
                  _hover={{ transform: 'scale(1.05)' }}
                />
                <MenuList>
                  <MenuItem
                    icon={<FiCamera />}
                    onClick={handleFileSelect}
                    isDisabled={isUploading}
                  >
                    {user.profile_image_url ? 'Đổi ảnh đại diện' : 'Thêm ảnh đại diện'}
                  </MenuItem>
                  
                  {user.profile_image_url && (
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={handleDeleteImage}
                      isDisabled={isUploading}
                      color="red.500"
                    >
                      Xóa ảnh đại diện
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            )}
          </Box>
        )}
      </Box>

      {canEdit && (
        <VStack spacing={2}>
          <HStack spacing={2}>
            <Button
              leftIcon={<FiUpload />}
              onClick={handleFileSelect}
              isLoading={isUploading}
              loadingText="Đang upload..."
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              {user.profile_image_url ? 'Đổi ảnh' : 'Upload ảnh'}
            </Button>
            
            {user.profile_image_url && (
              <Tooltip label="Xóa ảnh đại diện">
                <IconButton
                  icon={<FiTrash2 />}
                  onClick={handleDeleteImage}
                  isLoading={isUploading}
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  aria-label="Xóa ảnh đại diện"
                />
              </Tooltip>
            )}
          </HStack>
          
          <Text fontSize="xs" color="gray.500" textAlign="center">
            PNG, JPG, JPEG hoặc GIF (tối đa 5MB)
          </Text>
        </VStack>
      )}

      {uploadError && (
        <Alert status="error" rounded="md" maxW="300px">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </VStack>
  );
};