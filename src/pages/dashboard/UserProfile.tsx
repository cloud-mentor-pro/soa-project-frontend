import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  Badge,
  VStack,
  HStack,

  Button,
  Grid,
  GridItem,
  Divider,
  Icon,
  Progress,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiShield, FiEdit3, FiLock } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useUserStatistics } from '../../hooks/queries/useScoreQueries';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ProfileImageUpload } from '../../components/users/ProfileImageUpload';


const UserProfile: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { statistics, isLoading: statsLoading } = useUserStatistics();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading || statsLoading) {
    return <LoadingSpinner message="Đang tải thông tin người dùng..." />;
  }

  const handleEditProfile = async (_formData: any) => {
    setIsUpdating(true);
    try {
      // TODO: Implement API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin cá nhân đã được cập nhật.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
    } catch (error) {
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (_formData: any) => {
    setIsUpdating(true);
    try {
      // TODO: Implement API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: 'Đổi mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được thay đổi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPasswordClose();
    } catch (error) {
      toast({
        title: 'Lỗi đổi mật khẩu',
        description: 'Không thể thay đổi mật khẩu. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <Stack gap={8} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Hồ Sơ Cá Nhân
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Quản lý thông tin tài khoản và theo dõi tiến độ học tập của bạn
          </Text>
        </Box>

        {user && (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
            {/* User Info Section */}
            <GridItem>
              <Stack spacing={6}>
                {/* Basic Info Card */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {/* Profile Image and basic info */}
                      <VStack spacing={4}>
                        <ProfileImageUpload
                          user={user}
                          canEdit={true}
                          size="2xl"
                          onImageUpdate={(_newImageUrl) => {
                            // This would typically update the user state
                            // For now, we'll just refresh to show the updated image
                            window.location.reload();
                          }}
                        />
                        <VStack align="center" spacing={2}>
                          <Heading size="lg">{user.username}</Heading>
                          <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="md">
                            {user.email}
                          </Text>
                          <HStack spacing={2}>
                            <Badge
                              colorScheme={user.active ? 'green' : 'red'}
                              variant="subtle"
                              px={3}
                              py={1}
                            >
                              {user.active ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                            {user.admin && (
                              <Badge colorScheme="purple" variant="subtle" px={3} py={1}>
                                Quản trị viên
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </VStack>

                      <Divider />

                      {/* Detailed Account Info */}
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Thông tin tài khoản</Heading>
                        
                        <HStack justify="space-between" p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                          <HStack>
                            <Icon as={FiUser} color="blue.500" />
                            <Text fontWeight="medium">ID người dùng</Text>
                          </HStack>
                          <Text color="gray.600" _dark={{ color: 'gray.400' }}>#{user.id}</Text>
                        </HStack>

                        <HStack justify="space-between" p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                          <HStack>
                            <Icon as={FiUser} color="green.500" />
                            <Text fontWeight="medium">Tên người dùng</Text>
                          </HStack>
                          <Text color="gray.600" _dark={{ color: 'gray.400' }}>{user.username}</Text>
                        </HStack>

                        <HStack justify="space-between" p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                          <HStack>
                            <Icon as={FiMail} color="purple.500" />
                            <Text fontWeight="medium">Email</Text>
                          </HStack>
                          <Text color="gray.600" _dark={{ color: 'gray.400' }}>{user.email}</Text>
                        </HStack>

                        <HStack justify="space-between" p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                          <HStack>
                            <Icon as={FiShield} color="orange.500" />
                            <Text fontWeight="medium">Quyền hạn</Text>
                          </HStack>
                          <Badge
                            colorScheme={user.admin ? 'purple' : 'gray'}
                            variant="subtle"
                          >
                            {user.admin ? 'Quản trị viên' : 'Người dùng'}
                          </Badge>
                        </HStack>
                      </VStack>

                      <Divider />

                      {/* Action Buttons */}
                      <HStack spacing={3}>
                        <Button 
                          leftIcon={<Icon as={FiEdit3} />}
                          colorScheme="blue" 
                          variant="outline"
                          onClick={onEditOpen}
                          flex={1}
                        >
                          Chỉnh sửa thông tin
                        </Button>
                        <Button 
                          leftIcon={<Icon as={FiLock} />}
                          variant="outline"
                          onClick={onPasswordOpen}
                          flex={1}
                        >
                          Đổi mật khẩu
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Stack>
            </GridItem>

            {/* Statistics Section */}
            <GridItem>
              <Stack spacing={6}>
                {/* Learning Progress Card */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <Heading size="md" mb={4}>Tiến Độ Học Tập</Heading>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Tỷ lệ thành công</Text>
                          <Text fontWeight="bold" color="green.500">
                            {statistics?.successRate || 0}%
                          </Text>
                        </HStack>
                        <Progress 
                          value={statistics?.successRate || 0} 
                          colorScheme="green" 
                          size="lg" 
                          borderRadius="full"
                        />
                      </Box>

                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Độ chính xác test cases</Text>
                          <Text fontWeight="bold" color="blue.500">
                            {statistics?.testCaseAccuracy || 0}%
                          </Text>
                        </HStack>
                        <Progress 
                          value={statistics?.testCaseAccuracy || 0} 
                          colorScheme="blue" 
                          size="lg" 
                          borderRadius="full"
                        />
                      </Box>

                      <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
                        <VStack>
                          <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            {statistics?.correctAnswers || 0}
                          </Text>
                          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
                            Bài hoàn thành
                          </Text>
                        </VStack>
                        <VStack>
                          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                            {statistics?.totalAttempts || 0}
                          </Text>
                          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
                            Tổng lượt thử
                          </Text>
                        </VStack>
                        <VStack>
                          <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                            {statistics?.currentStreak || 0}
                          </Text>
                          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
                            Chuỗi hiện tại
                          </Text>
                        </VStack>
                        <VStack>
                          <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                            {statistics?.maxStreak || 0}
                          </Text>
                          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
                            Chuỗi tối đa
                          </Text>
                        </VStack>
                      </Grid>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Achievement Card */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <Heading size="md" mb={4}>Thành Tích</Heading>
                    <VStack spacing={3} align="stretch">
                      {statistics?.correctAnswers && statistics.correctAnswers >= 10 && (
                        <HStack p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" borderLeft="4px solid" borderColor="green.500">
                          <Text>🏆</Text>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">Người Giải Quyết</Text>
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                              Hoàn thành 10+ bài tập
                            </Text>
                          </VStack>
                        </HStack>
                      )}
                      
                      {statistics?.maxStreak && statistics.maxStreak >= 5 && (
                        <HStack p={3} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" borderLeft="4px solid" borderColor="purple.500">
                          <Text>🔥</Text>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">Chuỗi Thành Công</Text>
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                              Đạt chuỗi 5+ lần liên tiếp
                            </Text>
                          </VStack>
                        </HStack>
                      )}
                      
                      {statistics?.successRate && statistics.successRate >= 80 && (
                        <HStack p={3} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                          <Text>⭐</Text>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">Chuyên Gia</Text>
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                              Tỷ lệ thành công trên 80%
                            </Text>
                          </VStack>
                        </HStack>
                      )}
                      
                      {(!statistics?.correctAnswers || statistics.correctAnswers === 0) && (
                        <Text color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center" py={4}>
                          Hoàn thành bài tập đầu tiên để mở khóa thành tích!
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Stack>
            </GridItem>
          </Grid>
        )}

        {/* Edit Profile Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Chỉnh Sửa Thông Tin</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Alert status="info" mb={4}>
                <AlertIcon />
                Tính năng chỉnh sửa thông tin sẽ được triển khai trong các task tiếp theo.
              </Alert>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Tên người dùng</FormLabel>
                  <Input defaultValue={user?.username} isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input defaultValue={user?.email} isDisabled />
                </FormControl>
                <HStack spacing={3} w="full" pt={4}>
                  <Button variant="outline" onClick={onEditClose} flex={1}>
                    Hủy
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => handleEditProfile({})}
                    isLoading={isUpdating}
                    flex={1}
                    isDisabled
                  >
                    Lưu thay đổi
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Change Password Modal */}
        <Modal isOpen={isPasswordOpen} onClose={onPasswordClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Đổi Mật Khẩu</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Alert status="info" mb={4}>
                <AlertIcon />
                Tính năng đổi mật khẩu sẽ được triển khai trong các task tiếp theo.
              </Alert>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <Input type="password" isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <Input type="password" isDisabled />
                </FormControl>
                <FormControl>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <Input type="password" isDisabled />
                </FormControl>
                <HStack spacing={3} w="full" pt={4}>
                  <Button variant="outline" onClick={onPasswordClose} flex={1}>
                    Hủy
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => handleChangePassword({})}
                    isLoading={isUpdating}
                    flex={1}
                    isDisabled
                  >
                    Đổi mật khẩu
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Stack>
    </ProtectedRoute>
  );
};

export default UserProfile;